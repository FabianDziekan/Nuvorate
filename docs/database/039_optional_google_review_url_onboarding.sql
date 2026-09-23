-- Keep the location entitlement contract from 023; only make the Google URL optional.
begin;

create or replace function public.create_business_location(
  p_name text,
  p_industry text,
  p_city text,
  p_google_review_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_plan public.nuvorate_plan;
  v_extra_location_count integer;
  v_included_location_count integer;
  v_allowed_location_count integer;
  v_current_location_count integer;
  v_business_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to create a business location'
      using errcode = '28000';
  end if;

  if nullif(btrim(p_name), '') is null
    or nullif(btrim(p_industry), '') is null
    or nullif(btrim(p_city), '') is null
    or (
      p_google_review_url is not null
      and p_google_review_url !~* '^https?://'
    )
  then
    raise exception 'Invalid business location details'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  select profile.plan, profile.extra_location_count
  into v_plan, v_extra_location_count
  from public.profiles profile
  where profile.user_id = v_user_id
  for update;

  if not found then
    raise exception 'Profile was not found for the authenticated user'
      using errcode = 'P0002';
  end if;

  v_included_location_count := case v_plan
    when 'business'::public.nuvorate_plan then 3
    when 'starter'::public.nuvorate_plan then 1
    when 'unpaid'::public.nuvorate_plan then 1
    else 0
  end;
  v_allowed_location_count := v_included_location_count
    + greatest(coalesce(v_extra_location_count, 0), 0);

  select count(*)
  into v_current_location_count
  from public.businesses business
  where business.owner_id = v_user_id;

  if v_current_location_count >= v_allowed_location_count then
    raise exception 'The location limit for this account has been reached'
      using errcode = 'P0001';
  end if;

  insert into public.businesses (
    owner_id,
    name,
    industry,
    city,
    google_review_url,
    setup_status
  )
  values (
    v_user_id,
    btrim(p_name),
    btrim(p_industry),
    btrim(p_city),
    nullif(btrim(p_google_review_url), ''),
    'completed'::public.business_setup_status
  )
  returning id into v_business_id;

  if not exists (
    select 1
    from public.business_memberships membership
    where membership.user_id = v_user_id
      and membership.business_id = v_business_id
      and membership.role = 'owner'::public.business_membership_role
  ) then
    raise exception 'Owner membership was not created for the new business'
      using errcode = 'P0001';
  end if;

  return v_business_id;
end;
$$;

revoke all on function public.create_business_location(text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_business_location(text, text, text, text)
  to authenticated;

commit;
