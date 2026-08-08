-- Google Business Profile OAuth foundation (no review sync in this stage).
begin;
create table if not exists public.google_business_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  google_account_id text,
  google_account_name text,
  google_location_id text,
  google_location_name text,
  google_location_title text,
  google_email text,
  encrypted_refresh_token text not null,
  access_token_expires_at timestamptz,
  status text not null default 'connected',
  last_error text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_business_connections_status check (status in ('connected', 'error'))
);
drop trigger if exists google_business_connections_set_updated_at on public.google_business_connections;
create trigger google_business_connections_set_updated_at before update on public.google_business_connections for each row execute function public.set_updated_at();
alter table public.google_business_connections enable row level security;
create policy "Owners can read own Google connection" on public.google_business_connections for select to authenticated using (exists (select 1 from public.businesses b where b.id = google_business_connections.business_id and b.owner_id = (select auth.uid())));
revoke all on public.google_business_connections from anon, authenticated;
grant select on public.google_business_connections to authenticated;
grant select, insert, update, delete on public.google_business_connections to service_role;
commit;
