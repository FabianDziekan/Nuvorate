-- NuvoRate: idempotent and ordered Stripe subscription cache synchronization.
-- Run manually in the Supabase SQL Editor after 019_automatic_business_analysis.sql.

begin;

alter table public.profiles
  add column if not exists stripe_price_id text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists stripe_last_event_created_at timestamptz,
  add column if not exists stripe_last_event_id text;

create index if not exists profiles_stripe_subscription_id_lookup_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists profiles_stripe_last_event_idx
  on public.profiles (stripe_last_event_created_at desc)
  where stripe_last_event_created_at is not null;

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  stripe_created_at timestamptz not null,
  processing_started_at timestamptz,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists stripe_webhook_events_processing_idx
  on public.stripe_webhook_events (processed_at, processing_started_at);

alter table public.stripe_webhook_events enable row level security;

revoke all on table public.stripe_webhook_events from anon, authenticated;
grant select, insert, update, delete on table public.stripe_webhook_events to service_role;

create or replace function public.claim_stripe_webhook_event(
  p_stripe_event_id text,
  p_event_type text,
  p_stripe_created_at timestamptz
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_state text;
begin
  insert into public.stripe_webhook_events (
    stripe_event_id,
    event_type,
    stripe_created_at,
    processing_started_at
  )
  values (
    p_stripe_event_id,
    p_event_type,
    p_stripe_created_at,
    now()
  )
  on conflict (stripe_event_id) do nothing;

  if found then
    return 'claimed';
  end if;

  select case
    when processed_at is not null then 'processed'
    when processing_started_at is null then 'retryable'
    when processing_started_at < now() - interval '10 minutes' then 'retryable'
    else 'processing'
  end
  into event_state
  from public.stripe_webhook_events
  where stripe_event_id = p_stripe_event_id;

  if event_state = 'retryable' then
    update public.stripe_webhook_events
    set processing_started_at = now(),
        last_error = null
    where stripe_event_id = p_stripe_event_id
      and processed_at is null
      and (
        processing_started_at is null
        or processing_started_at < now() - interval '10 minutes'
      );

    if found then
      return 'claimed';
    end if;
  end if;

  return coalesce(event_state, 'missing');
end;
$$;

create or replace function public.sync_stripe_subscription_state(
  p_user_id uuid,
  p_customer_id text,
  p_subscription_id text,
  p_price_id text,
  p_subscription_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean,
  p_plan public.nuvorate_plan,
  p_event_created_at timestamptz,
  p_event_id text,
  p_revoke_if_current boolean default false
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile public.profiles%rowtype;
begin
  select *
  into target_profile
  from public.profiles
  where (
    p_user_id is not null
    and user_id = p_user_id
  )
  or (
    p_user_id is null
    and stripe_subscription_id = p_subscription_id
  )
  or (
    p_user_id is null
    and stripe_subscription_id is null
    and stripe_customer_id = p_customer_id
  )
  order by case when p_user_id is not null and user_id = p_user_id then 0 else 1 end
  limit 1
  for update;

  if not found then
    return 'missing_profile';
  end if;

  if p_revoke_if_current
    and target_profile.stripe_subscription_id is distinct from p_subscription_id then
    return 'ignored_non_current_subscription';
  end if;

  if target_profile.stripe_last_event_created_at is not null
    and (
      target_profile.stripe_last_event_created_at > p_event_created_at
      or (
        target_profile.stripe_last_event_created_at = p_event_created_at
        and coalesce(target_profile.stripe_last_event_id, '') >= p_event_id
      )
    ) then
    return 'ignored_stale_event';
  end if;

  update public.profiles
  set plan = p_plan,
      stripe_customer_id = p_customer_id,
      stripe_subscription_id = p_subscription_id,
      stripe_price_id = p_price_id,
      subscription_status = p_subscription_status,
      current_period_end = p_current_period_end,
      cancel_at_period_end = p_cancel_at_period_end,
      stripe_last_event_created_at = p_event_created_at,
      stripe_last_event_id = p_event_id,
      updated_at = now()
  where user_id = target_profile.user_id;

  return 'synced';
end;
$$;

revoke all on function public.claim_stripe_webhook_event(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.claim_stripe_webhook_event(text, text, timestamptz) to service_role;

revoke all on function public.sync_stripe_subscription_state(uuid, text, text, text, text, timestamptz, boolean, public.nuvorate_plan, timestamptz, text, boolean) from public, anon, authenticated;
grant execute on function public.sync_stripe_subscription_state(uuid, text, text, text, text, timestamptz, boolean, public.nuvorate_plan, timestamptz, text, boolean) to service_role;

commit;
