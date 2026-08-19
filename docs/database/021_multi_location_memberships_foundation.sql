-- NuvoRate: multi-location membership and RLS foundation.
-- Run manually in the Supabase SQL Editor after 020_stripe_subscription_sync_safety.sql.
-- This migration does not add an active location, billing limits, or Google multi-location OAuth.

begin;

-- A profile remains the billing account/primary owner. A business now represents
-- one location and can have several authorized users.
-- Fail fast if production does not contain exactly the expected unique
-- constraint. Silently continuing would leave the schema in a false
-- multi-location state while owner_id was still unique.
do $$
declare
  v_owner_attnum smallint;
  v_constraint_name name;
  v_constraint_count integer;
  v_remaining_unique_indexes integer;
begin
  select attribute.attnum
  into v_owner_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.businesses'::regclass
    and attribute.attname = 'owner_id'
    and not attribute.attisdropped;

  if v_owner_attnum is null then
    raise exception 'Expected public.businesses.owner_id does not exist';
  end if;

  select count(*)
  into v_constraint_count
  from pg_catalog.pg_constraint constraint_entry
  where constraint_entry.conrelid = 'public.businesses'::regclass
    and constraint_entry.contype = 'u'
    and constraint_entry.conkey = array[v_owner_attnum]::smallint[];

  if v_constraint_count <> 1 then
    raise exception
      'Expected exactly one UNIQUE constraint on public.businesses(owner_id), found %',
      v_constraint_count;
  end if;

  select constraint_entry.conname
  into v_constraint_name
  from pg_catalog.pg_constraint constraint_entry
  where constraint_entry.conrelid = 'public.businesses'::regclass
    and constraint_entry.contype = 'u'
    and constraint_entry.conkey = array[v_owner_attnum]::smallint[];

  execute format(
    'alter table public.businesses drop constraint %I',
    v_constraint_name
  );

  select count(*)
  into v_remaining_unique_indexes
  from pg_catalog.pg_index index_entry
  where index_entry.indrelid = 'public.businesses'::regclass
    and index_entry.indisunique
    and array_length(index_entry.indkey::smallint[], 1) = 1
    and (index_entry.indkey::smallint[])[1] = v_owner_attnum;

  if v_remaining_unique_indexes <> 0 then
    raise exception
      'A UNIQUE index on public.businesses(owner_id) remains after dropping the constraint';
  end if;
end
$$;

create index if not exists businesses_owner_id_idx
  on public.businesses (owner_id, created_at desc);

do $$
begin
  create type public.business_membership_role as enum ('owner', 'admin', 'member');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.business_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  role public.business_membership_role not null default 'member',
  created_at timestamptz not null default now(),

  constraint business_memberships_user_business_unique unique (user_id, business_id)
);

create index if not exists business_memberships_user_business_idx
  on public.business_memberships (user_id, business_id);

create index if not exists business_memberships_business_user_idx
  on public.business_memberships (business_id, user_id);

-- Preserve every existing one-location account as an owner membership. The
-- unique constraint makes this idempotent and safe to run on production data.
insert into public.business_memberships (user_id, business_id, role)
select owner_id, id, 'owner'::public.business_membership_role
from public.businesses
on conflict (user_id, business_id) do update
set role = 'owner'::public.business_membership_role;

-- RLS policies call these SECURITY DEFINER helpers so the membership lookup
-- cannot recurse through business RLS and never trusts a client-provided id.
create or replace function public.can_access_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_memberships membership
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_memberships membership
    where membership.business_id = p_business_id
      and membership.user_id = (select auth.uid())
      and membership.role in ('owner'::public.business_membership_role, 'admin'::public.business_membership_role)
  );
$$;

revoke all on function public.can_access_business(uuid) from public, anon;
revoke all on function public.can_manage_business(uuid) from public, anon;
grant execute on function public.can_access_business(uuid) to authenticated, service_role;
grant execute on function public.can_manage_business(uuid) to authenticated, service_role;

-- Every business created through the existing onboarding flow receives an owner
-- membership automatically. The trigger is idempotent for imports/admin writes.
create or replace function public.create_owner_business_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.business_memberships (user_id, business_id, role)
  values (new.owner_id, new.id, 'owner'::public.business_membership_role)
  on conflict (user_id, business_id) do update
  set role = 'owner'::public.business_membership_role;

  return new;
end;
$$;

drop trigger if exists businesses_create_owner_membership on public.businesses;
create trigger businesses_create_owner_membership
after insert on public.businesses
for each row execute function public.create_owner_business_membership();

-- ETAP 1 remains a one-location application. RLS prevents ordinary browser
-- clients from creating another location, while this trigger serializes the
-- check so two concurrent first-business inserts cannot both succeed. ETAP 2
-- will replace this transition guard with the controlled location-create flow.
create or replace function public.enforce_single_business_during_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.owner_id::text, 0)
  );

  if exists (
    select 1
    from public.business_memberships membership
    where membership.user_id = new.owner_id
  ) then
    raise exception
      'Creating an additional business is unavailable until multi-location activation';
  end if;

  return new;
end;
$$;

drop trigger if exists businesses_enforce_single_business_during_transition on public.businesses;
create trigger businesses_enforce_single_business_during_transition
before insert on public.businesses
for each row execute function public.enforce_single_business_during_transition();

alter table public.business_memberships enable row level security;

revoke all on table public.business_memberships from anon, authenticated;
grant select on table public.business_memberships to authenticated;
grant select, insert, update, delete on table public.business_memberships to service_role;

drop policy if exists "Users can read own business memberships" on public.business_memberships;
create policy "Users can read own business memberships"
on public.business_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

-- Businesses: keep owner_id only as the primary ownership/billing link. Browser
-- clients cannot update owner_id; members can read, owners/admins can edit.
drop policy if exists "Businesses are readable by their owner" on public.businesses;
drop policy if exists "Businesses are creatable by their owner" on public.businesses;
drop policy if exists "Businesses are editable by their owner" on public.businesses;
drop policy if exists "Members can read accessible businesses" on public.businesses;
drop policy if exists "Owners can create businesses" on public.businesses;
drop policy if exists "Owners can create their first business during transition" on public.businesses;
drop policy if exists "Managers can edit accessible businesses" on public.businesses;

create policy "Members can read accessible businesses"
on public.businesses
for select
to authenticated
using (public.can_access_business(id));

create policy "Owners can create their first business during transition"
on public.businesses
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and not exists (
    select 1
    from public.business_memberships membership
    where membership.user_id = (select auth.uid())
  )
);

create policy "Managers can edit accessible businesses"
on public.businesses
for update
to authenticated
using (public.can_manage_business(id))
with check (public.can_manage_business(id));

revoke update on table public.businesses from authenticated;
grant update (
  name,
  industry,
  city,
  google_review_url,
  setup_status,
  monthly_review_goal
) on table public.businesses to authenticated;

-- Reviews
drop policy if exists "Reviews are readable by their business owner" on public.reviews;
drop policy if exists "Members can read accessible reviews" on public.reviews;
drop policy if exists "Managers can update accessible review responses" on public.reviews;

create policy "Members can read accessible reviews"
on public.reviews
for select
to authenticated
using (public.can_access_business(business_id));

drop policy if exists "Business owners can update review responses" on public.reviews;
create policy "Managers can update accessible review responses"
on public.reviews
for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

-- AI review responses and reputation analyses
drop policy if exists "AI review responses are manageable by their owner" on public.ai_review_responses;
drop policy if exists "Members can read accessible AI review responses" on public.ai_review_responses;
drop policy if exists "Managers can manage accessible AI review responses" on public.ai_review_responses;

create policy "Members can read accessible AI review responses"
on public.ai_review_responses
for select
to authenticated
using (public.can_access_business(business_id));

create policy "Managers can manage accessible AI review responses"
on public.ai_review_responses
for all
to authenticated
using (public.can_manage_business(business_id))
with check (
  public.can_manage_business(business_id)
  and exists (
    select 1
    from public.reviews review
    where review.id = ai_review_responses.review_id
      and review.business_id = ai_review_responses.business_id
  )
);

drop policy if exists "AI business analyses are manageable by their owner" on public.ai_business_analyses;
drop policy if exists "Members can read accessible AI business analyses" on public.ai_business_analyses;
drop policy if exists "Managers can manage accessible AI business analyses" on public.ai_business_analyses;

create policy "Members can read accessible AI business analyses"
on public.ai_business_analyses
for select
to authenticated
using (public.can_access_business(business_id));

create policy "Managers can manage accessible AI business analyses"
on public.ai_business_analyses
for all
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

-- Response settings
drop policy if exists "Business owners can read response settings" on public.business_response_settings;
drop policy if exists "Business owners can insert response settings" on public.business_response_settings;
drop policy if exists "Business owners can update response settings" on public.business_response_settings;
drop policy if exists "Members can read accessible response settings" on public.business_response_settings;
drop policy if exists "Managers can insert accessible response settings" on public.business_response_settings;
drop policy if exists "Managers can update accessible response settings" on public.business_response_settings;

create policy "Members can read accessible response settings"
on public.business_response_settings
for select
to authenticated
using (public.can_access_business(business_id));

create policy "Managers can insert accessible response settings"
on public.business_response_settings
for insert
to authenticated
with check (public.can_manage_business(business_id));

create policy "Managers can update accessible response settings"
on public.business_response_settings
for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

-- Automatic analysis settings
drop policy if exists "Business analysis automation is visible to its owner" on public.business_analysis_automation;
drop policy if exists "Business analysis automation is creatable by its owner" on public.business_analysis_automation;
drop policy if exists "Business analysis automation is editable by its owner" on public.business_analysis_automation;
drop policy if exists "Members can read accessible analysis automation" on public.business_analysis_automation;
drop policy if exists "Managers can insert accessible analysis automation" on public.business_analysis_automation;
drop policy if exists "Managers can update accessible analysis automation" on public.business_analysis_automation;

create policy "Members can read accessible analysis automation"
on public.business_analysis_automation
for select
to authenticated
using (public.can_access_business(business_id));

create policy "Managers can insert accessible analysis automation"
on public.business_analysis_automation
for insert
to authenticated
with check (public.can_manage_business(business_id));

create policy "Managers can update accessible analysis automation"
on public.business_analysis_automation
for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

-- NFC tags and scans
drop policy if exists "Owners can read own NFC tags" on public.nfc_tags;
drop policy if exists "Owners can create own NFC tags" on public.nfc_tags;
drop policy if exists "Owners can update own NFC tags" on public.nfc_tags;
drop policy if exists "Owners can delete own NFC tags" on public.nfc_tags;
drop policy if exists "Owners can read own NFC scans" on public.nfc_scans;
drop policy if exists "Members can read accessible NFC tags" on public.nfc_tags;
drop policy if exists "Managers can create accessible NFC tags" on public.nfc_tags;
drop policy if exists "Managers can update accessible NFC tags" on public.nfc_tags;
drop policy if exists "Managers can delete accessible NFC tags" on public.nfc_tags;
drop policy if exists "Members can read accessible NFC scans" on public.nfc_scans;

create policy "Members can read accessible NFC tags"
on public.nfc_tags for select to authenticated
using (public.can_access_business(business_id));

create policy "Managers can create accessible NFC tags"
on public.nfc_tags for insert to authenticated
with check (public.can_manage_business(business_id));

create policy "Managers can update accessible NFC tags"
on public.nfc_tags for update to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

create policy "Managers can delete accessible NFC tags"
on public.nfc_tags for delete to authenticated
using (public.can_manage_business(business_id));

create policy "Members can read accessible NFC scans"
on public.nfc_scans for select to authenticated
using (public.can_access_business(business_id));

-- Notifications
drop policy if exists "Owners can read own notifications" on public.notifications;
drop policy if exists "Owners can update own notifications" on public.notifications;
drop policy if exists "Members can read accessible notifications" on public.notifications;
drop policy if exists "Managers can update accessible notifications" on public.notifications;

create policy "Members can read accessible notifications"
on public.notifications
for select
to authenticated
using (public.can_access_business(business_id));

create policy "Managers can update accessible notifications"
on public.notifications
for update
to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

-- Google connections remain server-write-only; authorized members can only read
-- explicitly granted non-secret fields. In particular, encrypted_refresh_token
-- is never readable by browser clients.
drop policy if exists "Owners can read own Google connection" on public.google_business_connections;
drop policy if exists "Members can read accessible Google connections" on public.google_business_connections;

revoke select on table public.google_business_connections from authenticated;
grant select (
  id,
  business_id,
  google_account_id,
  google_account_name,
  google_location_id,
  google_location_name,
  google_location_title,
  google_email,
  access_token_expires_at,
  status,
  last_error,
  connected_at,
  updated_at
) on table public.google_business_connections to authenticated;

create policy "Members can read accessible Google connections"
on public.google_business_connections
for select
to authenticated
using (public.can_access_business(business_id));

-- The trend RPC is SECURITY INVOKER. Returning no buckets at all for an
-- inaccessible id avoids revealing even empty time-series structure.
create or replace function public.get_review_activity_trend(
  p_business_id uuid,
  p_range text default '30d'
)
returns table (
  period_start date,
  period_end date,
  review_count bigint,
  average_rating numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select case when p_range = '3m' then '3m' when p_range = '12m' then '12m' else '30d' end as selected_range
  ),
  buckets as (
    select day::date as period_start, day::date as period_end
    from params cross join generate_series(current_date - interval '29 days', current_date, interval '1 day') as day
    where params.selected_range = '30d'
    union all
    select week_start::date, least((week_start + interval '6 days')::date, current_date)
    from params cross join generate_series(date_trunc('week', current_date - interval '3 months')::date, date_trunc('week', current_date)::date, interval '1 week') as week_start
    where params.selected_range = '3m'
    union all
    select month_start::date, least((month_start + interval '1 month - 1 day')::date, current_date)
    from params cross join generate_series(date_trunc('month', current_date - interval '11 months')::date, date_trunc('month', current_date)::date, interval '1 month') as month_start
    where params.selected_range = '12m'
  )
  select buckets.period_start, buckets.period_end, count(reviews.id)::bigint, avg(reviews.rating)::numeric(3, 2)
  from buckets
  left join public.reviews
    on reviews.business_id = p_business_id
   and reviews.created_at >= buckets.period_start::timestamptz
   and reviews.created_at < (buckets.period_end + 1)::timestamptz
  where public.can_access_business(p_business_id)
  group by buckets.period_start, buckets.period_end
  order by buckets.period_start;
$$;

commit;
