-- NuvoRate: explicit automatic Google-publication opt-in and durable state.
-- Run manually after 029, 030 and 031. This migration does not call Google.

begin;

alter table public.business_response_settings
  add column if not exists auto_publish boolean not null default false;

alter table public.automatic_review_response_jobs
  add column if not exists publication_status text not null default 'not_requested',
  add column if not exists publication_attempt_count integer not null default 0,
  add column if not exists publication_last_error text,
  add column if not exists publication_last_attempt_at timestamptz,
  add column if not exists publication_completed_at timestamptz,
  add column if not exists publication_lease_token uuid,
  add column if not exists publication_lease_expires_at timestamptz;

alter table public.automatic_review_response_jobs
  drop constraint if exists automatic_review_response_jobs_publication_status_valid,
  drop constraint if exists automatic_review_response_jobs_publication_attempt_count_valid,
  drop constraint if exists automatic_review_response_jobs_publication_lease_consistent;

alter table public.automatic_review_response_jobs
  add constraint automatic_review_response_jobs_publication_status_valid
    check (publication_status in ('not_requested', 'pending', 'processing', 'completed', 'retryable_failed', 'terminal_failed')),
  add constraint automatic_review_response_jobs_publication_attempt_count_valid
    check (publication_attempt_count between 0 and 3),
  add constraint automatic_review_response_jobs_publication_lease_consistent
    check (
      (publication_status = 'processing' and publication_lease_token is not null and publication_lease_expires_at is not null)
      or (publication_status <> 'processing' and publication_lease_token is null and publication_lease_expires_at is null)
    );

create index if not exists automatic_review_response_jobs_publication_queue_idx
  on public.automatic_review_response_jobs (
    publication_status,
    publication_attempt_count,
    publication_lease_expires_at,
    created_at,
    id
  )
  where publication_attempt_count < 3
    and publication_status in ('pending', 'retryable_failed', 'processing');

-- The generation worker may only request or decline publication while it still
-- owns the generation lease. Google is intentionally not called in this phase.
create or replace function public.set_automatic_review_response_publication_state(
  p_job_id uuid,
  p_lease_token uuid,
  p_publication_status text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_publication_status not in ('not_requested', 'pending') then
    raise exception 'Automatic publication handoff state is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as job
  set
    publication_status = p_publication_status,
    publication_last_error = null,
    publication_lease_token = null,
    publication_lease_expires_at = null,
    updated_at = pg_catalog.clock_timestamp()
  where job.id = p_job_id
    and job.status = 'processing'
    and job.lease_token = p_lease_token
    and job.lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- This is a foundation-only claim. No route invokes it yet and it never calls
-- Google; it gives the future publisher a separate lease from AI generation.
create or replace function public.claim_automatic_review_response_publication_jobs(
  p_limit integer,
  p_lease_seconds integer,
  p_lease_token uuid
)
returns table (
  job_id uuid,
  business_id uuid,
  review_id uuid,
  billing_owner_id uuid,
  publication_lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 25 then
    raise exception 'Automatic publication batch size must be between 1 and 25' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 or p_lease_token is null then
    raise exception 'Automatic publication lease is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as exhausted
  set
    publication_status = 'terminal_failed',
    publication_lease_token = null,
    publication_lease_expires_at = null,
    publication_last_error = 'publication_attempt_limit_reached',
    updated_at = pg_catalog.clock_timestamp()
  where exhausted.publication_status = 'processing'
    and exhausted.publication_lease_expires_at <= pg_catalog.clock_timestamp()
    and exhausted.publication_attempt_count >= 3;

  return query
  with candidates as materialized (
    select job.id
    from public.automatic_review_response_jobs as job
    join public.ai_usage_reservations as reservation
      on reservation.id = job.ai_usage_reservation_id
      and reservation.status = 'completed'
    join public.reviews as review
      on review.id = job.review_id
      and review.business_id = job.business_id
    join public.business_response_settings as settings
      on settings.business_id = job.business_id
    where job.status = 'completed'
      and job.publication_attempt_count < 3
      and settings.auto_generate = true
      and settings.auto_publish = true
      and review.rating = any(settings.enabled_ratings)
      and review.response_status = 'ready'
      and coalesce(nullif(btrim(review.response_text), ''), '') <> ''
      and review.response_published_at is null
      and (
        job.publication_status = 'pending'
        or job.publication_status = 'retryable_failed'
        or (job.publication_status = 'processing' and job.publication_lease_expires_at <= pg_catalog.clock_timestamp())
      )
    order by job.created_at asc, job.id asc
    for update of job skip locked
    limit p_limit
  ), claimed as (
    update public.automatic_review_response_jobs as job
    set
      publication_status = 'processing',
      publication_lease_token = p_lease_token,
      publication_lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
      publication_attempt_count = job.publication_attempt_count + 1,
      publication_last_attempt_at = pg_catalog.clock_timestamp(),
      publication_last_error = null,
      updated_at = pg_catalog.clock_timestamp()
    from candidates
    where job.id = candidates.id
    returning job.id, job.business_id, job.review_id, job.billing_owner_id, job.publication_lease_token
  )
  select claimed.id, claimed.business_id, claimed.review_id, claimed.billing_owner_id, claimed.publication_lease_token
  from claimed;
end;
$$;

create or replace function public.finish_automatic_review_response_publication(
  p_job_id uuid,
  p_lease_token uuid,
  p_publication_status text,
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
  if p_publication_status not in ('completed', 'retryable_failed', 'terminal_failed') then
    raise exception 'Automatic publication final state is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as job
  set
    publication_status = p_publication_status,
    publication_lease_token = null,
    publication_lease_expires_at = null,
    publication_last_error = case
      when p_publication_status in ('retryable_failed', 'terminal_failed')
        then left(coalesce(nullif(btrim(p_last_error), ''), 'publication_failed'), 240)
      else null
    end,
    publication_completed_at = case
      when p_publication_status = 'completed' then pg_catalog.clock_timestamp()
      else null
    end,
    updated_at = pg_catalog.clock_timestamp()
  where job.id = p_job_id
    and job.status = 'completed'
    and job.publication_status = 'processing'
    and job.publication_lease_token = p_lease_token
    and job.publication_lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

create or replace function public.renew_automatic_review_response_publication_lease(
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
    raise exception 'Automatic publication lease is invalid' using errcode = '22023';
  end if;

  update public.automatic_review_response_jobs as job
  set
    publication_lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
    updated_at = pg_catalog.clock_timestamp()
  where job.id = p_job_id
    and job.status = 'completed'
    and job.publication_status = 'processing'
    and job.publication_lease_token = p_lease_token
    and job.publication_lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

revoke all on function public.set_automatic_review_response_publication_state(uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.claim_automatic_review_response_publication_jobs(integer, integer, uuid)
  from public, anon, authenticated;
revoke all on function public.finish_automatic_review_response_publication(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.renew_automatic_review_response_publication_lease(uuid, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.set_automatic_review_response_publication_state(uuid, uuid, text)
  to service_role;
grant execute on function public.claim_automatic_review_response_publication_jobs(integer, integer, uuid)
  to service_role;
grant execute on function public.finish_automatic_review_response_publication(uuid, uuid, text, text)
  to service_role;
grant execute on function public.renew_automatic_review_response_publication_lease(uuid, uuid, integer)
  to service_role;

commit;
