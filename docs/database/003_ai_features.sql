-- NuvoRate: AI review responses and business analyses
-- Run this file in the Supabase SQL Editor after 002_reviews.sql.

begin;

create extension if not exists pgcrypto;

create table if not exists public.ai_review_responses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  review_id uuid not null unique references public.reviews (id) on delete cascade,
  response_text text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_review_responses_text_not_blank
    check (length(trim(response_text)) > 0)
);

create table if not exists public.ai_business_analyses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  review_count integer not null,
  summary text not null,
  praised_elements jsonb not null default '[]'::jsonb,
  reported_problems jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ai_business_analyses_period_valid
    check (period_start < period_end),
  constraint ai_business_analyses_review_count_valid
    check (review_count >= 0),
  constraint ai_business_analyses_summary_not_blank
    check (length(trim(summary)) > 0),
  constraint ai_business_analyses_praised_array
    check (jsonb_typeof(praised_elements) = 'array'),
  constraint ai_business_analyses_problems_array
    check (jsonb_typeof(reported_problems) = 'array'),
  constraint ai_business_analyses_recommendations_array
    check (jsonb_typeof(recommendations) = 'array')
);

create index if not exists ai_review_responses_business_idx
  on public.ai_review_responses (business_id, created_at desc);

create index if not exists ai_business_analyses_business_idx
  on public.ai_business_analyses (business_id, created_at desc);

drop trigger if exists ai_review_responses_set_updated_at
  on public.ai_review_responses;
create trigger ai_review_responses_set_updated_at
before update on public.ai_review_responses
for each row
execute function public.set_updated_at();

drop trigger if exists ai_business_analyses_set_updated_at
  on public.ai_business_analyses;
create trigger ai_business_analyses_set_updated_at
before update on public.ai_business_analyses
for each row
execute function public.set_updated_at();

alter table public.ai_review_responses enable row level security;
alter table public.ai_business_analyses enable row level security;

drop policy if exists "AI review responses are manageable by their owner"
  on public.ai_review_responses;
create policy "AI review responses are manageable by their owner"
on public.ai_review_responses
for all
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = ai_review_responses.business_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = ai_review_responses.business_id
      and businesses.owner_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.reviews
    where reviews.id = ai_review_responses.review_id
      and reviews.business_id = ai_review_responses.business_id
  )
);

drop policy if exists "AI business analyses are manageable by their owner"
  on public.ai_business_analyses;
create policy "AI business analyses are manageable by their owner"
on public.ai_business_analyses
for all
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = ai_business_analyses.business_id
      and businesses.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = ai_business_analyses.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

revoke all on table public.ai_review_responses from anon;
revoke all on table public.ai_business_analyses from anon;

grant select, insert, update
  on table public.ai_review_responses
  to authenticated;

grant select, insert, update
  on table public.ai_business_analyses
  to authenticated;

commit;
