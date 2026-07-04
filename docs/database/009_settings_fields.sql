-- NuvoRate: settings page fields
-- Run this file in the Supabase SQL Editor after 008_review_responses.sql.

begin;

alter table public.business_response_settings
  add column if not exists response_tone text not null default 'professional';

alter table public.business_response_settings
  drop constraint if exists business_response_settings_response_tone_valid;

alter table public.business_response_settings
  add constraint business_response_settings_response_tone_valid
  check (
    response_tone in (
      'professional',
      'friendly',
      'short',
      'premium'
    )
  );

comment on column public.business_response_settings.response_tone is
  'Preferred tone for generated review responses.';

commit;
