-- NuvoRate: allow an explicit manual customer match method.
-- Run after 035_author_verification_foundation.sql.

begin;

alter table public.review_author_matches
  drop constraint review_author_matches_method_valid;

alter table public.review_author_matches
  add constraint review_author_matches_method_valid
  check (match_method in ('exact_name', 'normalized_name', 'partial_name', 'none', 'anonymous', 'manual'));

commit;
