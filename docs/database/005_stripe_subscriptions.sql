-- NuvoRate: Stripe subscription fields for owner profiles
-- Run this file in the Supabase SQL Editor after 004_business_analysis_score_trend.sql.

begin;

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists current_period_end timestamptz;

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

comment on column public.profiles.stripe_customer_id is
  'Stripe Customer ID for subscription billing.';

comment on column public.profiles.stripe_subscription_id is
  'Latest Stripe Subscription ID for the owner.';

comment on column public.profiles.subscription_status is
  'Latest Stripe subscription status received from webhook.';

comment on column public.profiles.current_period_end is
  'Current subscription period end received from Stripe.';

comment on column public.profiles.plan is
  'Current NuvoRate plan. Stripe webhooks are the billing source of truth.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, plan)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'starter'::public.nuvorate_plan
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

commit;
