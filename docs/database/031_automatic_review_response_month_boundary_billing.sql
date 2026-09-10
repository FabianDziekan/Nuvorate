-- NuvoRate: charge automatic-review retries in the month they reserve usage.
-- Run manually after 029 and 030. This migration does not create a cron job.

begin;

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
  v_previous_period_month date;
  v_used integer := 0;
  v_expired integer := 0;
  v_charge_current boolean := false;
begin
  if p_limit < 0 then
    raise exception 'AI usage limit cannot be negative' using errcode = '22023';
  end if;

  select * into v_job
  from public.automatic_review_response_jobs
  where id = p_job_id
    and status = 'processing'
    and lease_token = p_lease_token
    and lease_expires_at > pg_catalog.clock_timestamp()
  for update;
  if v_job.id is null then
    return query select null::uuid, false, false;
    return;
  end if;

  -- Read only the period first. Every lifecycle path then takes usage-bucket
  -- advisory locks before the reservation row lock. For a rebase, take both
  -- buckets in chronological order, preventing a retry/release lock cycle.
  select * into v_reservation
  from public.ai_usage_reservations
  where automatic_review_response_job_id = v_job.id;

  if v_reservation.id is not null
    and v_reservation.status <> 'completed'
    and v_reservation.period_month <> v_period_month then
    v_previous_period_month := v_reservation.period_month;

    if v_previous_period_month < v_period_month then
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          v_job.billing_owner_id::text || ':' || v_previous_period_month::text || ':reply',
          0
        )
      );
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          v_job.billing_owner_id::text || ':' || v_period_month::text || ':reply',
          0
        )
      );
    else
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          v_job.billing_owner_id::text || ':' || v_period_month::text || ':reply',
          0
        )
      );
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          v_job.billing_owner_id::text || ':' || v_previous_period_month::text || ':reply',
          0
        )
      );
    end if;
  else
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        v_job.billing_owner_id::text || ':' || v_period_month::text || ':reply',
        0
      )
    );
  end if;

  select * into v_reservation
  from public.ai_usage_reservations
  where automatic_review_response_job_id = v_job.id
  for update;

  if v_reservation.id is not null and v_reservation.status = 'completed' then
    return query select v_reservation.id, true, true;
    return;
  end if;

  -- A non-completed reservation must always belong to the month whose counter
  -- it can reserve. For an old active reservation, first undo its old-month
  -- counter exactly once. A released reservation was already undone.
  if v_reservation.id is not null and v_reservation.period_month <> v_period_month then
    if v_reservation.status = 'reserved' then
      update public.ai_usage
      set
        ai_replies_used = greatest(ai_replies_used - 1, 0),
        updated_at = pg_catalog.clock_timestamp()
      where user_id = v_job.billing_owner_id
        and period_month = v_previous_period_month;
    end if;

    update public.ai_usage_reservations
    set
      period_month = v_period_month,
      status = 'released',
      released_at = pg_catalog.clock_timestamp()
    where id = v_reservation.id;

    select * into v_reservation
    from public.ai_usage_reservations
    where id = v_reservation.id
    for update;
  end if;

  insert into public.ai_usage (user_id, period_month, ai_replies_used, ai_analyses_used)
  values (v_job.billing_owner_id, v_period_month, 0, 0)
  on conflict (user_id, period_month) do nothing;

  with expired as (
    update public.ai_usage_reservations
    set status = 'released', released_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id
      and period_month = v_period_month
      and usage_kind = 'reply'
      and status = 'reserved'
      and expires_at <= pg_catalog.clock_timestamp()
    returning 1
  )
  select count(*)::integer into v_expired from expired;

  if v_expired > 0 then
    update public.ai_usage
    set
      ai_replies_used = greatest(ai_replies_used - v_expired, 0),
      updated_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id
      and period_month = v_period_month;
  end if;

  select * into v_reservation
  from public.ai_usage_reservations
  where automatic_review_response_job_id = v_job.id
  for update;

  select ai_replies_used into v_used
  from public.ai_usage
  where user_id = v_job.billing_owner_id
    and period_month = v_period_month
  for update;

  if (v_reservation.id is null or v_reservation.status = 'released') and v_used >= p_limit then
    return query select null::uuid, false, false;
    return;
  end if;

  if v_reservation.id is null then
    insert into public.ai_usage_reservations (
      user_id,
      period_month,
      usage_kind,
      automatic_review_response_job_id
    )
    values (v_job.billing_owner_id, v_period_month, 'reply', v_job.id)
    returning * into v_reservation;
    v_charge_current := true;
  elsif v_reservation.status = 'released' then
    update public.ai_usage_reservations
    set
      status = 'reserved',
      released_at = null,
      expires_at = pg_catalog.clock_timestamp() + interval '15 minutes'
    where id = v_reservation.id;
    v_charge_current := true;
  elsif v_reservation.status = 'reserved' then
    update public.ai_usage_reservations
    set expires_at = pg_catalog.clock_timestamp() + interval '15 minutes'
    where id = v_reservation.id;
  end if;

  -- A new or reactivated reservation belongs to the current month. A current
  -- live reservation was already charged in this same month and is only renewed.
  if v_charge_current then
    update public.ai_usage
    set
      ai_replies_used = ai_replies_used + 1,
      updated_at = pg_catalog.clock_timestamp()
    where user_id = v_job.billing_owner_id
      and period_month = v_period_month;
  end if;

  update public.automatic_review_response_jobs
  set ai_usage_reservation_id = v_reservation.id, updated_at = pg_catalog.clock_timestamp()
  where id = v_job.id;

  return query select v_reservation.id, true, false;
end;
$$;

revoke all on function public.reserve_ai_usage_for_automatic_review_job(uuid, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.reserve_ai_usage_for_automatic_review_job(uuid, uuid, integer)
  to service_role;

commit;
