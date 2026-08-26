-- Google review identity for idempotent Google Business Profile synchronisation.
begin;

alter table public.reviews
  add column if not exists google_review_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'public.reviews'::regclass
      and constraint_row.conname = 'reviews_business_google_review_id_key'
  ) then
    alter table public.reviews
      add constraint reviews_business_google_review_id_key
      unique (business_id, google_review_id);
  end if;
end;
$$;

comment on column public.reviews.google_review_id is
  'Immutable Google Business Profile review identifier. Unique within a NuvoRate business when present.';

commit;
