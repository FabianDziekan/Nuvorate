-- NuvoRate: recurring Business reputation analysis and immutable analysis snapshots.
-- Run after 018_google_business_oauth_foundation.sql.

begin;

alter table public.ai_business_analyses
  add column if not exists analysis_type text not null default 'manual',
  add column if not exists average_rating numeric(3,2),
  add column if not exists negative_review_share numeric(5,2),
  add column if not exists positive_review_share numeric(5,2);

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_type_valid;
alter table public.ai_business_analyses
  add constraint ai_business_analyses_type_valid
  check (analysis_type in ('manual', 'automatic'));

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_average_rating_valid;
alter table public.ai_business_analyses
  add constraint ai_business_analyses_average_rating_valid
  check (average_rating is null or (average_rating >= 0 and average_rating <= 5));

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_negative_share_valid;
alter table public.ai_business_analyses
  add constraint ai_business_analyses_negative_share_valid
  check (negative_review_share is null or (negative_review_share >= 0 and negative_review_share <= 100));

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_positive_share_valid;
alter table public.ai_business_analyses
  add constraint ai_business_analyses_positive_share_valid
  check (positive_review_share is null or (positive_review_share >= 0 and positive_review_share <= 100));

create table if not exists public.business_analysis_automation (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses (id) on delete cascade,
  is_enabled boolean not null default false,
  frequency_days integer not null default 14,
  next_run_at timestamptz,
  last_run_at timestamptz,
  last_skip_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint business_analysis_automation_frequency_valid
    check (frequency_days in (7, 14, 30))
);

create index if not exists business_analysis_automation_due_idx
  on public.business_analysis_automation (next_run_at)
  where is_enabled = true;

drop trigger if exists business_analysis_automation_set_updated_at
  on public.business_analysis_automation;
create trigger business_analysis_automation_set_updated_at
before update on public.business_analysis_automation
for each row
execute function public.set_updated_at();

alter table public.business_analysis_automation enable row level security;
revoke all on table public.business_analysis_automation from anon;
grant select, insert, update on table public.business_analysis_automation to authenticated;
grant select, insert, update, delete on table public.business_analysis_automation to service_role;

drop policy if exists "Business analysis automation is visible to its owner"
  on public.business_analysis_automation;
create policy "Business analysis automation is visible to its owner"
on public.business_analysis_automation
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_analysis_automation.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Business analysis automation is creatable by its owner"
  on public.business_analysis_automation;
create policy "Business analysis automation is creatable by its owner"
on public.business_analysis_automation
for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_analysis_automation.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

drop policy if exists "Business analysis automation is editable by its owner"
  on public.business_analysis_automation;
create policy "Business analysis automation is editable by its owner"
on public.business_analysis_automation
for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_analysis_automation.business_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_analysis_automation.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

commit;
