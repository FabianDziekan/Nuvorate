-- NuvoRate: atomic monthly AI usage reservations
-- Run this file after 014_profile_first_name.sql.

begin;

create extension if not exists pgcrypto;

create table if not exists public.ai_usage_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  period_month date not null,
  usage_kind text not null,
  status text not null default 'reserved',
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  released_at timestamptz,

  constraint ai_usage_reservations_kind_valid
    check (usage_kind in ('reply', 'analysis')),
  constraint ai_usage_reservations_status_valid
    check (status in ('reserved', 'completed', 'released')),
  constraint ai_usage_reservations_period_first_day
    check (date_trunc('month', period_month)::date = period_month)
);

create index if not exists ai_usage_reservations_active_idx
  on public.ai_usage_reservations (user_id, period_month, usage_kind, expires_at)
  where status = 'reserved';

alter table public.ai_usage_reservations enable row level security;

revoke all on table public.ai_usage_reservations from anon, authenticated;
grant select, insert, update on table public.ai_usage_reservations to service_role;

-- Counters must never be writable from the browser. All mutations now go through
-- the security-definer reservation functions below, called with the service role.
drop policy if exists "AI usage is creatable by its owner" on public.ai_usage;
drop policy if exists "AI usage is editable by its owner" on public.ai_usage;
revoke insert, update on table public.ai_usage from authenticated;

create or replace function public.reserve_ai_usage(
  p_user_id uuid,
  p_period_month date,
  p_usage_kind text,
  p_limit integer
)
returns table (
  reservation_id uuid,
  reserved boolean,
  used integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired integer := 0;
  v_used integer := 0;
  v_reservation_id uuid;
begin
  if p_usage_kind not in ('reply', 'analysis') then
    raise exception 'Unsupported AI usage kind';
  end if;

  if p_limit < 0 then
    raise exception 'AI usage limit cannot be negative';
  end if;

  -- Serializes reserve/release operations for one user, month and usage kind.
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_user_id::text || ':' || p_period_month::text || ':' || p_usage_kind,
      0
    )
  );

  insert into public.ai_usage (
    user_id,
    period_month,
    ai_replies_used,
    ai_analyses_used
  )
  values (p_user_id, p_period_month, 0, 0)
  on conflict (user_id, period_month) do nothing;

  with expired as (
    update public.ai_usage_reservations
    set
      status = 'released',
      released_at = now()
    where user_id = p_user_id
      and period_month = p_period_month
      and usage_kind = p_usage_kind
      and status = 'reserved'
      and expires_at <= now()
    returning 1
  )
  select count(*)::integer into v_expired from expired;

  if v_expired > 0 then
    update public.ai_usage
    set
      ai_replies_used = case
        when p_usage_kind = 'reply'
          then greatest(ai_replies_used - v_expired, 0)
        else ai_replies_used
      end,
      ai_analyses_used = case
        when p_usage_kind = 'analysis'
          then greatest(ai_analyses_used - v_expired, 0)
        else ai_analyses_used
      end,
      updated_at = now()
    where user_id = p_user_id
      and period_month = p_period_month;
  end if;

  select case
    when p_usage_kind = 'reply' then ai_replies_used
    else ai_analyses_used
  end
  into v_used
  from public.ai_usage
  where user_id = p_user_id
    and period_month = p_period_month
  for update;

  if v_used >= p_limit then
    return query select null::uuid, false, v_used;
    return;
  end if;

  insert into public.ai_usage_reservations (
    user_id,
    period_month,
    usage_kind
  )
  values (p_user_id, p_period_month, p_usage_kind)
  returning id into v_reservation_id;

  update public.ai_usage
  set
    ai_replies_used = case
      when p_usage_kind = 'reply' then ai_replies_used + 1
      else ai_replies_used
    end,
    ai_analyses_used = case
      when p_usage_kind = 'analysis' then ai_analyses_used + 1
      else ai_analyses_used
    end,
    updated_at = now()
  where user_id = p_user_id
    and period_month = p_period_month;

  return query select v_reservation_id, true, v_used + 1;
end;
$$;

create or replace function public.complete_ai_usage_reservation(
  p_reservation_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated uuid;
begin
  update public.ai_usage_reservations
  set
    status = 'completed',
    completed_at = now()
  where id = p_reservation_id
    and user_id = p_user_id
    and status = 'reserved'
  returning id into v_updated;

  return v_updated is not null;
end;
$$;

create or replace function public.release_ai_usage_reservation(
  p_reservation_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation public.ai_usage_reservations%rowtype;
begin
  select *
  into v_reservation
  from public.ai_usage_reservations
  where id = p_reservation_id
    and user_id = p_user_id;

  if v_reservation.id is null or v_reservation.status <> 'reserved' then
    return false;
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      v_reservation.user_id::text || ':' ||
      v_reservation.period_month::text || ':' ||
      v_reservation.usage_kind,
      0
    )
  );

  select *
  into v_reservation
  from public.ai_usage_reservations
  where id = p_reservation_id
    and user_id = p_user_id
  for update;

  if v_reservation.id is null or v_reservation.status <> 'reserved' then
    return false;
  end if;

  update public.ai_usage_reservations
  set
    status = 'released',
    released_at = now()
  where id = v_reservation.id
    and status = 'reserved';

  update public.ai_usage
  set
    ai_replies_used = case
      when v_reservation.usage_kind = 'reply'
        then greatest(ai_replies_used - 1, 0)
      else ai_replies_used
    end,
    ai_analyses_used = case
      when v_reservation.usage_kind = 'analysis'
        then greatest(ai_analyses_used - 1, 0)
      else ai_analyses_used
    end,
    updated_at = now()
  where user_id = v_reservation.user_id
    and period_month = v_reservation.period_month;

  return true;
end;
$$;

revoke all on function public.reserve_ai_usage(uuid, date, text, integer)
  from public, anon, authenticated;
revoke all on function public.complete_ai_usage_reservation(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.release_ai_usage_reservation(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.reserve_ai_usage(uuid, date, text, integer)
  to service_role;
grant execute on function public.complete_ai_usage_reservation(uuid, uuid)
  to service_role;
grant execute on function public.release_ai_usage_reservation(uuid, uuid)
  to service_role;

-- Full analysis fields are Business-only and may only be read/written by trusted
-- server code after a capability check. Starter keeps direct access to the basic
-- analysis projection required by its dashboard.
revoke select, insert, update on table public.ai_business_analyses
  from authenticated;
grant select (
  id,
  business_id,
  period_start,
  period_end,
  review_count,
  summary,
  praised_elements,
  model,
  created_at,
  updated_at
) on table public.ai_business_analyses to authenticated;
grant select, insert, update on table public.ai_business_analyses
  to service_role;

commit;
