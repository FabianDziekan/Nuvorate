-- NuvoRate: persistent active business selection.
-- Run manually in Supabase SQL Editor after 021_multi_location_memberships_foundation.sql.
-- This migration deliberately does not change Stripe, Google OAuth, or UI.

begin;

-- The selection is a preference only. Access to every business remains governed
-- by business_memberships and the can_access_business/can_manage_business RLS helpers.
alter table public.profiles
  add column if not exists active_business_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_entry
    where constraint_entry.conrelid = 'public.profiles'::regclass
      and constraint_entry.conname = 'profiles_active_business_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_active_business_id_fkey
      foreign key (active_business_id)
      references public.businesses(id)
      on delete set null;
  end if;
end
$$;

-- This index supports the foreign-key action when a business is removed and
-- keeps the nullable preference inexpensive to maintain.
create index if not exists profiles_active_business_id_idx
  on public.profiles (active_business_id)
  where active_business_id is not null;

-- Browser clients retain the profile fields they could already edit, but never
-- receive a table-level UPDATE grant or a direct privilege for
-- active_business_id. This also protects production from any historical broad
-- UPDATE grant that would otherwise bypass the intended RPC boundary.
revoke update on table public.profiles from authenticated;
grant update (full_name, first_name) on table public.profiles to authenticated;

create or replace function public.set_active_business(p_business_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Authentication is required to select an active business'
      using errcode = '28000';
  end if;

  -- Clearing an existing selection is safe and is useful if the user no longer
  -- has any accessible location. It never grants access to a business.
  if p_business_id is null then
    update public.profiles
    set active_business_id = null
    where user_id = v_user_id;

    if not found then
      raise exception 'Profile was not found for the authenticated user'
        using errcode = 'P0002';
    end if;

    return null;
  end if;

  -- The function deliberately derives the user from auth.uid() and validates
  -- the requested business against the current membership table. A UUID from
  -- the client is therefore never an authorization proof.
  if not exists (
    select 1
    from public.business_memberships membership
    where membership.user_id = v_user_id
      and membership.business_id = p_business_id
  ) then
    raise exception 'The authenticated user cannot select this business'
      using errcode = '42501';
  end if;

  update public.profiles
  set active_business_id = p_business_id
  where user_id = v_user_id;

  if not found then
    raise exception 'Profile was not found for the authenticated user'
      using errcode = 'P0002';
  end if;

  return p_business_id;
end;
$$;

revoke all on function public.set_active_business(uuid) from public, anon, authenticated;
grant execute on function public.set_active_business(uuid) to authenticated;

-- A deleted membership must not leave a stale preference behind. The FK above
-- handles deleted businesses; this trigger covers membership removal while the
-- business itself remains valid for other users.
create or replace function public.clear_active_business_after_membership_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set active_business_id = null
  where user_id = old.user_id
    and active_business_id = old.business_id;

  return old;
end;
$$;

drop trigger if exists business_memberships_clear_active_business on public.business_memberships;
create trigger business_memberships_clear_active_business
after delete on public.business_memberships
for each row execute function public.clear_active_business_after_membership_delete();

commit;
