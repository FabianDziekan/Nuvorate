-- NuvoRate: NFC public links and scan statistics
-- Run after 015_atomic_ai_usage_reservations.sql in the Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

create table if not exists public.nfc_tags (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  name text not null,
  public_token text not null unique,
  destination_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint nfc_tags_name_not_blank check (length(trim(name)) > 0),
  constraint nfc_tags_token_minimum_length check (length(public_token) >= 20),
  constraint nfc_tags_google_destination check (
    destination_url ~* '^https://(([a-z0-9-]+\.)*google\.com|([a-z0-9-]+\.)*g\.page|maps\.app\.goo\.gl|([a-z0-9-]+\.)*share\.google)(/|$)'
  )
);

create table if not exists public.nfc_scans (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.nfc_tags(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  scanned_at timestamptz not null default now()
);

create index if not exists nfc_scans_business_scanned_at_idx
  on public.nfc_scans (business_id, scanned_at desc);

create index if not exists nfc_scans_tag_scanned_at_idx
  on public.nfc_scans (tag_id, scanned_at desc);

drop trigger if exists nfc_tags_set_updated_at on public.nfc_tags;
create trigger nfc_tags_set_updated_at
before update on public.nfc_tags
for each row
execute function public.set_updated_at();

alter table public.nfc_tags enable row level security;
alter table public.nfc_scans enable row level security;

drop policy if exists "Owners can read own NFC tags" on public.nfc_tags;
create policy "Owners can read own NFC tags"
on public.nfc_tags for select to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = nfc_tags.business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Owners can create own NFC tags" on public.nfc_tags;
create policy "Owners can create own NFC tags"
on public.nfc_tags for insert to authenticated
with check (exists (
  select 1 from public.businesses b
  where b.id = nfc_tags.business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Owners can update own NFC tags" on public.nfc_tags;
create policy "Owners can update own NFC tags"
on public.nfc_tags for update to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = nfc_tags.business_id and b.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.businesses b
  where b.id = nfc_tags.business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Owners can delete own NFC tags" on public.nfc_tags;
create policy "Owners can delete own NFC tags"
on public.nfc_tags for delete to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = nfc_tags.business_id and b.owner_id = (select auth.uid())
));

drop policy if exists "Owners can read own NFC scans" on public.nfc_scans;
create policy "Owners can read own NFC scans"
on public.nfc_scans for select to authenticated
using (exists (
  select 1 from public.businesses b
  where b.id = nfc_scans.business_id and b.owner_id = (select auth.uid())
));

-- Browser clients can never create scan events. The /r/[token] server route
-- uses service_role after reading only an active token.
revoke all on public.nfc_tags, public.nfc_scans from anon;
revoke insert, update, delete on public.nfc_scans from authenticated;
grant select, insert, update, delete on public.nfc_tags to authenticated;
grant select on public.nfc_scans to authenticated;
grant select, insert on public.nfc_tags, public.nfc_scans to service_role;

commit;
