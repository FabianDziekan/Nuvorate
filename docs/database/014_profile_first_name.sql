-- NuvoRate: owner first name for personalized UI
-- Run this file in the Supabase SQL Editor after 013_monthly_review_goal.sql.

alter table public.profiles
  add column if not exists first_name text;

comment on column public.profiles.first_name is
  'Owner first name used for personalized greetings and account UI.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name, first_name, plan)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    'unpaid'::public.nuvorate_plan
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

grant update (first_name) on table public.profiles to authenticated;
