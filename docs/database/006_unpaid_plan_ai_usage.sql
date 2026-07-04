-- NuvoRate: unpaid plan and monthly AI usage limits
-- Run this file in the Supabase SQL Editor after 005_stripe_subscriptions.sql.

alter type public.nuvorate_plan add value if not exists 'unpaid';

alter table public.profiles
  alter column plan set default 'unpaid'::public.nuvorate_plan;

comment on column public.profiles.plan is
  'Current NuvoRate plan. New users start as unpaid; Stripe webhooks activate starter or business.';

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
    'unpaid'::public.nuvorate_plan
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  period_month date not null,
  ai_replies_used integer not null default 0,
  ai_analyses_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_usage_unique_user_month unique (user_id, period_month),
  constraint ai_usage_period_month_first_day
    check (date_trunc('month', period_month)::date = period_month),
  constraint ai_usage_replies_non_negative
    check (ai_replies_used >= 0),
  constraint ai_usage_analyses_non_negative
    check (ai_analyses_used >= 0)
);

drop trigger if exists ai_usage_set_updated_at on public.ai_usage;
create trigger ai_usage_set_updated_at
before update on public.ai_usage
for each row
execute function public.set_updated_at();

alter table public.ai_usage enable row level security;

drop policy if exists "AI usage is readable by its owner" on public.ai_usage;
create policy "AI usage is readable by its owner"
on public.ai_usage
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "AI usage is creatable by its owner" on public.ai_usage;
create policy "AI usage is creatable by its owner"
on public.ai_usage
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "AI usage is editable by its owner" on public.ai_usage;
create policy "AI usage is editable by its owner"
on public.ai_usage
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.ai_usage from anon;
grant select, insert, update on table public.ai_usage to authenticated;
