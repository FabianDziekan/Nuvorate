-- NuvoRate: durable automatic AI review-response jobs.
-- Run manually after 028. This migration intentionally does not create a cron job.

begin;

alter table public.ai_usage_reservations
  add column if not exists automatic_review_response_job_id uuid;

alter table public.reviews
  add column if not exists automatic_response_enqueue_pending boolean not null default false;

-- Reviews that existed before this feature are deliberately not eligible for a
-- future queue retry. A trigger marks only newly inserted Google reviews.
update public.reviews
set automatic_response_enqueue_pending = false
where source = 'google';

create or replace function public.mark_new_google_review_for_automatic_response()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.source = 'google' then
    new.automatic_response_enqueue_pending := true;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_mark_new_google_review_for_automatic_response on public.reviews;
create trigger reviews_mark_new_google_review_for_automatic_response
before insert on public.reviews
for each row
execute function public.mark_new_google_review_for_automatic_response();

create index if not exists reviews_automatic_response_enqueue_pending_idx
  on public.reviews (business_id, id)
  where automatic_response_enqueue_pending = true and source = 'google';

create table if not exists public.automatic_review_response_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  review_id uuid not null unique references public.reviews(id) on delete cascade,
  billing_owner_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null default 'pending',
  lease_token uuid,
  lease_expires_at timestamptz,
  ai_usage_reservation_id uuid unique references public.ai_usage_reservations(id) on delete set null,
  attempt_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint automatic_review_response_jobs_status_valid
    check (status in ('pending', 'processing', 'completed', 'skipped', 'failed')),
  constraint automatic_review_response_jobs_attempt_count_non_negative
    check (attempt_count between 0 and 3),
  constraint automatic_review_response_jobs_lease_consistent
    check (
      (status = 'processing' and lease_token is not null and lease_expires_at is not null)
      or (status <> 'processing' and lease_token is null and lease_expires_at is null)
    )
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ai_usage_reservations'::regclass
      and conname = 'ai_usage_reservations_automatic_job_unique'
  ) then
    alter table public.ai_usage_reservations
      add constraint ai_usage_reservations_automatic_job_unique
      unique (automatic_review_response_job_id);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ai_usage_reservations'::regclass
      and conname = 'ai_usage_reservations_automatic_job_fkey'
  ) then
    alter table public.ai_usage_reservations
      add constraint ai_usage_reservations_automatic_job_fkey
      foreign key (automatic_review_response_job_id)
      references public.automatic_review_response_jobs(id)
      on delete set null;
  end if;
end;
$$;

create index if not exists automatic_review_response_jobs_queue_idx
  on public.automatic_review_response_jobs (status, attempt_count, lease_expires_at, created_at, id)
  where attempt_count < 3
    and status in ('pending', 'failed', 'processing');

create index if not exists automatic_review_response_jobs_expired_lease_idx
  on public.automatic_review_response_jobs (lease_expires_at, id)
  where status = 'processing';

-- Existing Google reviews are explicitly baselined as already seen. They must
-- never be picked up merely because automatic responses are enabled later.
insert into public.automatic_review_response_jobs (
  business_id, review_id, billing_owner_id, status, completed_at
)
select review.business_id, review.id, business.owner_id, 'skipped', now()
from public.reviews as review
join public.businesses as business on business.id = review.business_id
where review.source = 'google'
on conflict (review_id) do nothing;

alter table public.automatic_review_response_jobs enable row level security;
revoke all on table public.automatic_review_response_jobs from anon, authenticated;
grant select, insert, update, delete on table public.automatic_review_response_jobs to service_role;

-- Only fresh IDs returned by the Google sync are considered. The database
-- repeats eligibility checks so a caller cannot enqueue an arbitrary review.
create or replace function public.enqueue_automatic_review_response_jobs(
  p_business_id uuid,
  p_review_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted integer := 0;
begin
  if p_business_id is null or coalesce(array_length(p_review_ids, 1), 0) = 0 then
    return 0;
  end if;

  with eligible as (
    select review.id as review_id, business.owner_id as billing_owner_id
    from public.reviews as review
    join public.businesses as business on business.id = review.business_id
    join public.business_response_settings as settings on settings.business_id = review.business_id
    join public.profiles as billing_profile on billing_profile.user_id = business.owner_id
    where review.business_id = p_business_id
      and review.id = any(p_review_ids)
      and review.source = 'google'
      and settings.auto_generate = true
      and review.rating = any(settings.enabled_ratings)
      and review.response_status <> 'responded'
      and coalesce(nullif(btrim(review.response_text), ''), '') = ''
      and billing_profile.plan = 'business'::public.nuvorate_plan
      and not exists (
        select 1 from public.ai_review_responses as ai
        where ai.review_id = review.id
      )
  ), inserted as (
    insert into public.automatic_review_response_jobs (business_id, review_id, billing_owner_id)
    select p_business_id, eligible.review_id, eligible.billing_owner_id
    from eligible
    on conflict (review_id) do nothing
    returning id
  )
  select count(*)::integer into v_inserted from inserted;

  -- This is the durable outbox acknowledgement. If this function fails, the
  -- transaction rolls back and the next sync can retry only pending new rows.
  update public.reviews as review
  set automatic_response_enqueue_pending = false
  where review.business_id = p_business_id
    and review.id = any(p_review_ids)
    and review.automatic_response_enqueue_pending = true;

  return v_inserted;
end;
$$;

create or replace function public.claim_automatic_review_response_jobs(
  p_limit integer,
  p_lease_seconds integer,
  p_lease_token uuid
)
returns table (
  job_id uuid,
  business_id uuid,
  review_id uuid,
  billing_owner_id uuid,
  ai_usage_reservation_id uuid,
  lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 25 then
    raise exception 'Automatic response batch size must be between 1 and 25' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 or p_lease_token is null then
    raise exception 'Automatic response lease is invalid' using errcode = '22023';
  end if;

  -- A worker that exhausted its third lease is terminally failed, even if it
  -- crashed before it could persist the failure itself.
  update public.automatic_review_response_jobs as exhausted
  set
    status = 'failed',
    lease_token = null,
    lease_expires_at = null,
    last_error = 'attempt_limit_reached',
    updated_at = pg_catalog.clock_timestamp()
  where exhausted.status = 'processing'
    and exhausted.lease_expires_at <= pg_catalog.clock_timestamp()
    and exhausted.attempt_count >= 3;

  return query
  with candidates as materialized (
    select job.id
    from public.automatic_review_response_jobs as job
    where job.attempt_count < 3
      and (
        job.status = 'pending'
        or job.status = 'failed'
        or (job.status = 'processing' and job.lease_expires_at <= pg_catalog.clock_timestamp())
      )
    order by job.created_at asc, job.id asc
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.automatic_review_response_jobs as job
    set
      status = 'processing',
      lease_token = p_lease_token,
      lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
      attempt_count = job.attempt_count + 1,
      last_error = null,
      updated_at = pg_catalog.clock_timestamp()
    from candidates
    where job.id = candidates.id
    returning job.id, job.business_id, job.review_id, job.billing_owner_id, job.ai_usage_reservation_id, job.lease_token
  )
  select claimed.id, claimed.business_id, claimed.review_id, claimed.billing_owner_id, claimed.ai_usage_reservation_id, claimed.lease_token
  from claimed;
end;
$$;

create or replace function public.finish_automatic_review_response_job(
  p_job_id uuid,
  p_lease_token uuid,
  p_status text,
  p_last_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_status not in ('completed', 'skipped', 'failed') then
    raise exception 'Automatic response final status is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as job
  set
    status = p_status,
    lease_token = null,
    lease_expires_at = null,
    last_error = case when p_status = 'failed' then left(coalesce(nullif(btrim(p_last_error), ''), 'generation_failed'), 240) else null end,
    completed_at = case when p_status in ('completed', 'skipped') then pg_catalog.clock_timestamp() else null end,
    updated_at = pg_catalog.clock_timestamp()
  where job.id = p_job_id
    and job.status = 'processing'
    and job.lease_token = p_lease_token
    and job.lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

create or replace function public.renew_automatic_review_response_job_lease(
  p_job_id uuid,
  p_lease_token uuid,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'Automatic response lease is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as job
  set
    lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
    updated_at = pg_catalog.clock_timestamp()
  where job.id = p_job_id
    and job.status = 'processing'
    and job.lease_token = p_lease_token
    and job.lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- Reservation, counter increment and job association happen in one transaction.
-- A retry reuses the same job reservation instead of charging the review again.
create or replace function public.reserve_ai_usage_for_automatic_review_job(
  p_job_id uuid,
  p_lease_token uuid,
  p_limit integer
)
returns table (reservation_id uuid, reserved boolean, already_completed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.automatic_review_response_jobs%rowtype;
  v_reservation public.ai_usage_reservations%rowtype;
  v_period_month date := date_trunc('month', pg_catalog.clock_timestamp())::date;
  v_used integer := 0;
  v_expired integer := 0;
begin
  if p_limit < 0 then raise exception 'AI usage limit cannot be negative' using errcode = '22023'; end if;

  select * into v_job from public.automatic_review_response_jobs
  where id = p_job_id
    and status = 'processing'
    and lease_token = p_lease_token
    and lease_expires_at > pg_catalog.clock_timestamp()
  for update;
  if v_job.id is null then return query select null::uuid, false, false; return; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_job.billing_owner_id::text || ':' || v_period_month::text || ':reply', 0));

  select * into v_reservation from public.ai_usage_reservations
  where automatic_review_response_job_id = v_job.id for update;
  if v_reservation.id is not null and v_reservation.status = 'completed' then
    return query select v_reservation.id, true, true; return;
  end if;

  insert into public.ai_usage (user_id, period_month, ai_replies_used, ai_analyses_used)
  values (v_job.billing_owner_id, v_period_month, 0, 0)
  on conflict (user_id, period_month) do nothing;

  with expired as (
    update public.ai_usage_reservations set status = 'released', released_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id and period_month = v_period_month and usage_kind = 'reply'
      and status = 'reserved' and expires_at <= pg_catalog.clock_timestamp()
    returning 1
  ) select count(*)::integer into v_expired from expired;
  if v_expired > 0 then
    update public.ai_usage set ai_replies_used = greatest(ai_replies_used - v_expired, 0), updated_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id and period_month = v_period_month;
  end if;

  -- The reservation may have been released by the expiry sweep above.
  select * into v_reservation from public.ai_usage_reservations
  where automatic_review_response_job_id = v_job.id for update;

  select ai_replies_used into v_used from public.ai_usage
  where user_id = v_job.billing_owner_id and period_month = v_period_month for update;

  if v_reservation.id is null and v_used >= p_limit then
    return query select null::uuid, false, false; return;
  end if;

  if v_reservation.id is null then
    insert into public.ai_usage_reservations (user_id, period_month, usage_kind, automatic_review_response_job_id)
    values (v_job.billing_owner_id, v_period_month, 'reply', v_job.id)
    returning * into v_reservation;
    update public.ai_usage set ai_replies_used = ai_replies_used + 1, updated_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id and period_month = v_period_month;
  elsif v_reservation.status = 'released' then
    if v_used >= p_limit then return query select null::uuid, false, false; return; end if;
    update public.ai_usage_reservations set status = 'reserved', released_at = null, expires_at = pg_catalog.clock_timestamp() + interval '15 minutes'
    where id = v_reservation.id;
    update public.ai_usage set ai_replies_used = ai_replies_used + 1, updated_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id and period_month = v_period_month;
  elsif v_reservation.status = 'reserved' then
    update public.ai_usage_reservations
    set expires_at = pg_catalog.clock_timestamp() + interval '15 minutes'
    where id = v_reservation.id;
  end if;

  update public.automatic_review_response_jobs set ai_usage_reservation_id = v_reservation.id, updated_at = pg_catalog.clock_timestamp()
  where id = v_job.id;
  return query select v_reservation.id, true, false;
end;
$$;

revoke all on function public.enqueue_automatic_review_response_jobs(uuid, uuid[]) from public, anon, authenticated;
revoke all on function public.claim_automatic_review_response_jobs(integer, integer, uuid) from public, anon, authenticated;
revoke all on function public.finish_automatic_review_response_job(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.reserve_ai_usage_for_automatic_review_job(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.renew_automatic_review_response_job_lease(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.enqueue_automatic_review_response_jobs(uuid, uuid[]) to service_role;
grant execute on function public.claim_automatic_review_response_jobs(integer, integer, uuid) to service_role;
grant execute on function public.finish_automatic_review_response_job(uuid, uuid, text, text) to service_role;
grant execute on function public.reserve_ai_usage_for_automatic_review_job(uuid, uuid, integer) to service_role;
grant execute on function public.renew_automatic_review_response_job_lease(uuid, uuid, integer) to service_role;

commit;
