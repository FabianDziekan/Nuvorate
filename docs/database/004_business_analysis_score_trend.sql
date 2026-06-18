-- NuvoRate: reputation score and trend for Business AI analyses
-- Run this file in the Supabase SQL Editor after 003_ai_features.sql.

begin;

alter table public.ai_business_analyses
  add column if not exists score integer,
  add column if not exists trend text;

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_score_valid;

alter table public.ai_business_analyses
  add constraint ai_business_analyses_score_valid
  check (score between 0 and 100);

alter table public.ai_business_analyses
  drop constraint if exists ai_business_analyses_trend_valid;

alter table public.ai_business_analyses
  add constraint ai_business_analyses_trend_valid
  check (trend in ('up', 'down', 'stable'));

commit;
