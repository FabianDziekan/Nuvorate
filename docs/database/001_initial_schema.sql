-- NuvoRate: initial owner and business schema
-- Run this file in the Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.nuvorate_plan as enum ('starter', 'business');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.business_setup_status as enum (
    'not_started',
    'in_progress',
    'completed'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan public.nuvorate_plan not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public application profile for a NuvoRate owner. One row per auth.users account.';

comment on column public.profiles.plan is
  'Selected NuvoRate subscription plan. Billing is not handled in this schema.';

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (user_id) on delete cascade,
  name text,
  industry text,
  city text,
  google_review_url text,
  setup_status public.business_setup_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint businesses_name_not_blank
    check (name is null or length(trim(name)) > 0),
  constraint businesses_industry_not_blank
    check (industry is null or length(trim(industry)) > 0),
  constraint businesses_city_not_blank
    check (city is null or length(trim(city)) > 0),
  constraint businesses_google_review_url_valid
    check (
      google_review_url is null
      or google_review_url ~* '^https?://'
    )
);

comment on table public.businesses is
  'A NuvoRate business owned by one profile. The unique owner_id enforces one owner = one business.';

comment on column public.businesses.google_review_url is
  'Google review destination URL supplied by the owner. Google integration is outside this schema.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_plan public.nuvorate_plan;
begin
  selected_plan :=
    case
      when new.raw_user_meta_data ->> 'selected_plan' = 'business'
        then 'business'::public.nuvorate_plan
      else 'starter'::public.nuvorate_plan
    end;

  insert into public.profiles (user_id, full_name, plan)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    selected_plan
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Create profiles for users registered before this migration was installed.
insert into public.profiles (user_id, full_name, plan)
select
  users.id,
  nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
  case
    when users.raw_user_meta_data ->> 'selected_plan' = 'business'
      then 'business'::public.nuvorate_plan
    else 'starter'::public.nuvorate_plan
  end
from auth.users as users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Businesses are readable by their owner" on public.businesses;
create policy "Businesses are readable by their owner"
on public.businesses
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Businesses are creatable by their owner" on public.businesses;
create policy "Businesses are creatable by their owner"
on public.businesses
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Businesses are editable by their owner" on public.businesses;
create policy "Businesses are editable by their owner"
on public.businesses
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

revoke all on table public.profiles from anon;
revoke all on table public.businesses from anon;

grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;
grant select, insert, update on table public.businesses to authenticated;

commit;
