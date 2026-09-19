-- NuvoRate: durable leasing and bounded retries for automatic Business analysis.
-- Run manually after 021. This migration does not call OpenAI or schedule cron.

begin;

alter table public.business_analysis_automation
  add column if not exists analysis_lease_token uuid,
  add column if not exists analysis_lease_expires_at timestamptz,
  add column if not exists analysis_processing_started_at timestamptz,
  add column if not exists automatic_failure_count integer not null default 0,
  add column if not exists last_failure_at timestamptz;

alter table public.business_analysis_automation
  drop constraint if exists business_analysis_automation_failure_count_valid;
alter table public.business_analysis_automation
  add constraint business_analysis_automation_failure_count_valid
  check (automatic_failure_count between 0 and 2);

create index if not exists business_analysis_automation_claim_queue_idx
  on public.business_analysis_automation (
    next_run_at asc,
    analysis_lease_expires_at asc nulls first,
    business_id asc
  )
  where is_enabled = true and next_run_at is not null;

-- Claims only due schedules. SKIP LOCKED and the per-row lease token fence
-- concurrent workers; an expired lease is recoverable after a worker crash.
create or replace function public.claim_automatic_business_analysis_schedules(
  p_limit integer,
  p_lease_seconds integer,
  p_lease_token uuid
)
returns table (
  business_id uuid,
  frequency_days integer,
  analysis_lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 25 then
    raise exception 'Automatic analysis batch size must be between 1 and 25'
      using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'Automatic analysis lease must be between 30 and 3600 seconds'
      using errcode = '22023';
  end if;
  if p_lease_token is null then
    raise exception 'Automatic analysis lease token is required' using errcode = '22023';
  end if;

  return query
  with candidates as materialized (
    select schedule.business_id
    from public.business_analysis_automation as schedule
    where schedule.is_enabled = true
      and schedule.next_run_at is not null
      and schedule.next_run_at <= pg_catalog.clock_timestamp()
      and (
        schedule.analysis_lease_expires_at is null
        or schedule.analysis_lease_expires_at <= pg_catalog.clock_timestamp()
      )
    order by schedule.next_run_at asc, schedule.business_id asc
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.business_analysis_automation as schedule
    set
      analysis_lease_token = p_lease_token,
      analysis_lease_expires_at = pg_catalog.clock_timestamp()
        + pg_catalog.make_interval(secs => p_lease_seconds),
      analysis_processing_started_at = pg_catalog.clock_timestamp(),
      updated_at = pg_catalog.clock_timestamp()
    from candidates
    where schedule.business_id = candidates.business_id
    returning schedule.business_id, schedule.frequency_days, schedule.analysis_lease_token
  )
  select claimed.business_id, claimed.frequency_days, claimed.analysis_lease_token
  from claimed;
end;
$$;

-- A current lease doubles as a final opt-in and frequency fence. A worker must
-- pass this immediately before each costly provider operation and before write.
create or replace function public.renew_automatic_business_analysis_schedule_lease(
  p_business_id uuid,
  p_frequency_days integer,
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
  if p_business_id is null or p_lease_token is null then
    raise exception 'Automatic analysis schedule and lease token are required'
      using errcode = '22023';
  end if;
  if p_frequency_days not in (7, 14, 30) then
    raise exception 'Automatic analysis frequency is invalid' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'Automatic analysis lease must be between 30 and 3600 seconds'
      using errcode = '22023';
  end if;

  update public.business_analysis_automation as schedule
  set
    analysis_lease_expires_at = pg_catalog.clock_timestamp()
      + pg_catalog.make_interval(secs => p_lease_seconds),
    updated_at = pg_catalog.clock_timestamp()
  where schedule.business_id = p_business_id
    and schedule.is_enabled = true
    and schedule.frequency_days = p_frequency_days
    and schedule.next_run_at is not null
    and schedule.next_run_at <= pg_catalog.clock_timestamp()
    and schedule.analysis_lease_token = p_lease_token
    and schedule.analysis_lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- Releases a stale or cancelled worker without changing a setting that a user
-- may have just saved. The token prevents an old worker clearing a new lease.
create or replace function public.release_automatic_business_analysis_schedule_lease(
  p_business_id uuid,
  p_lease_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_business_id is null or p_lease_token is null then
    raise exception 'Automatic analysis schedule and lease token are required'
      using errcode = '22023';
  end if;

  update public.business_analysis_automation as schedule
  set
    analysis_lease_token = null,
    analysis_lease_expires_at = null,
    analysis_processing_started_at = null,
    updated_at = pg_catalog.clock_timestamp()
  where schedule.business_id = p_business_id
    and schedule.analysis_lease_token = p_lease_token
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- Finishes only the still-current lease. Frequency changes and opt-outs make
-- this return false, preserving the newer user-owned schedule unchanged.
create or replace function public.finish_automatic_business_analysis_schedule(
  p_business_id uuid,
  p_frequency_days integer,
  p_lease_token uuid,
  p_outcome text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_business_id is null or p_lease_token is null then
    raise exception 'Automatic analysis schedule and lease token are required'
      using errcode = '22023';
  end if;
  if p_frequency_days not in (7, 14, 30) then
    raise exception 'Automatic analysis frequency is invalid' using errcode = '22023';
  end if;
  if p_outcome not in ('success', 'no_reviews', 'limit', 'technical', 'disabled') then
    raise exception 'Automatic analysis final outcome is invalid' using errcode = '22023';
  end if;

  if p_outcome = 'disabled' then
    update public.business_analysis_automation as schedule
    set
      is_enabled = false,
      next_run_at = null,
      last_skip_reason = 'Plan Business nie jest aktywny.',
      analysis_lease_token = null,
      analysis_lease_expires_at = null,
      analysis_processing_started_at = null,
      updated_at = pg_catalog.clock_timestamp()
    where schedule.business_id = p_business_id
      and schedule.is_enabled = true
      and schedule.frequency_days = p_frequency_days
      and schedule.next_run_at is not null
      and schedule.next_run_at <= pg_catalog.clock_timestamp()
      and schedule.analysis_lease_token = p_lease_token
      and schedule.analysis_lease_expires_at > pg_catalog.clock_timestamp()
    returning true into v_updated;
    return coalesce(v_updated, false);
  end if;

  update public.business_analysis_automation as schedule
  set
    last_run_at = case
      when p_outcome = 'success' then pg_catalog.clock_timestamp()
      else schedule.last_run_at
    end,
    next_run_at = case
      when p_outcome in ('success', 'no_reviews') then
        pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => p_frequency_days)
      when p_outcome = 'limit' then
        (pg_catalog.date_trunc('month', pg_catalog.clock_timestamp() at time zone 'UTC') at time zone 'UTC')
          + interval '1 month 5 minutes'
      when p_outcome = 'technical' and schedule.automatic_failure_count = 0 then
        pg_catalog.clock_timestamp() + interval '1 hour'
      when p_outcome = 'technical' and schedule.automatic_failure_count = 1 then
        pg_catalog.clock_timestamp() + interval '6 hours'
      else
        pg_catalog.clock_timestamp() + pg_catalog.make_interval(days => p_frequency_days)
    end,
    last_skip_reason = case
      when p_outcome = 'success' then null
      when p_outcome = 'no_reviews' then
        'Automatyczna analiza została pominięta — brak opinii do analizy.'
      when p_outcome = 'limit' then
        'Automatyczna analiza została pominięta — wykorzystano miesięczny limit analiz.'
      when schedule.automatic_failure_count >= 2 then
        'Automatyczna analiza nie została wykonana po trzech próbach. Kolejna próba nastąpi zgodnie z harmonogramem.'
      else
        'Automatyczna analiza nie została wykonana. Spróbujemy ponownie z bezpiecznym opóźnieniem.'
    end,
    automatic_failure_count = case
      when p_outcome = 'technical' and schedule.automatic_failure_count < 2
        then schedule.automatic_failure_count + 1
      else 0
    end,
    last_failure_at = case
      when p_outcome = 'technical' then pg_catalog.clock_timestamp()
      else null
    end,
    analysis_lease_token = null,
    analysis_lease_expires_at = null,
    analysis_processing_started_at = null,
    updated_at = pg_catalog.clock_timestamp()
  where schedule.business_id = p_business_id
    and schedule.is_enabled = true
    and schedule.frequency_days = p_frequency_days
    and schedule.next_run_at is not null
    and schedule.next_run_at <= pg_catalog.clock_timestamp()
    and schedule.analysis_lease_token = p_lease_token
    and schedule.analysis_lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

revoke all on function public.claim_automatic_business_analysis_schedules(integer, integer, uuid)
  from public, anon, authenticated;
revoke all on function public.renew_automatic_business_analysis_schedule_lease(uuid, integer, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.release_automatic_business_analysis_schedule_lease(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.finish_automatic_business_analysis_schedule(uuid, integer, uuid, text)
  from public, anon, authenticated;

grant execute on function public.claim_automatic_business_analysis_schedules(integer, integer, uuid)
  to service_role;
grant execute on function public.renew_automatic_business_analysis_schedule_lease(uuid, integer, uuid, integer)
  to service_role;
grant execute on function public.release_automatic_business_analysis_schedule_lease(uuid, uuid)
  to service_role;
grant execute on function public.finish_automatic_business_analysis_schedule(uuid, integer, uuid, text)
  to service_role;

commit;
