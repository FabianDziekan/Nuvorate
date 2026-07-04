-- NuvoRate: response management module
-- Run this file in the Supabase SQL Editor after 003_ai_features.sql.

begin;

create extension if not exists pgcrypto;

alter table public.reviews
  add column if not exists response_text text,
  add column if not exists response_status text not null default 'pending',
  add column if not exists response_generated_at timestamptz;

alter table public.reviews
  drop constraint if exists reviews_response_status_valid;

alter table public.reviews
  add constraint reviews_response_status_valid
  check (response_status in ('pending', 'ready', 'responded'));

create table if not exists public.business_response_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  auto_generate boolean not null default false,
  enabled_ratings int[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint business_response_settings_business_unique unique (business_id),
  constraint business_response_settings_ratings_valid
    check (
      enabled_ratings <@ array[1, 2, 3, 4, 5]
    )
);

comment on table public.business_response_settings is
  'Per-business UI settings for response generation preferences. No background automation is enabled yet.';

create index if not exists reviews_business_response_status_idx
  on public.reviews (business_id, response_status, created_at desc);

alter table public.business_response_settings enable row level security;

drop policy if exists "Business owners can read response settings" on public.business_response_settings;
create policy "Business owners can read response settings"
on public.business_response_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_response_settings.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Business owners can insert response settings" on public.business_response_settings;
create policy "Business owners can insert response settings"
on public.business_response_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_response_settings.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Business owners can update response settings" on public.business_response_settings;
create policy "Business owners can update response settings"
on public.business_response_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_response_settings.business_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_response_settings.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Business owners can update review responses" on public.reviews;
create policy "Business owners can update review responses"
on public.reviews
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = reviews.business_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = reviews.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

grant update (response_text, response_status, response_generated_at)
on table public.reviews
to authenticated;

revoke all on table public.business_response_settings from anon;
revoke all on table public.business_response_settings from authenticated;
grant select, insert, update on table public.business_response_settings to authenticated;

commit;
