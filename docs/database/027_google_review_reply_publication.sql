-- Persist the timestamp of a reply successfully published to Google Business Profile.
begin;

alter table public.reviews
  add column if not exists response_published_at timestamptz;

comment on column public.reviews.response_published_at is
  'Timestamp returned by Google Business Profile for the current owner reply.';

commit;
