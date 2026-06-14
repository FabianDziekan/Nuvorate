-- NuvoRate: reviews module
-- Run this file in the Supabase SQL Editor after 001_initial_schema.sql.

begin;

create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  author_name text not null,
  rating smallint not null,
  content text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),

  constraint reviews_author_name_not_blank
    check (length(trim(author_name)) > 0),
  constraint reviews_rating_valid
    check (rating between 1 and 5),
  constraint reviews_content_not_blank
    check (length(trim(content)) > 0),
  constraint reviews_source_not_blank
    check (length(trim(source)) > 0)
);

comment on table public.reviews is
  'Customer reviews assigned to a single NuvoRate business.';

comment on column public.reviews.source is
  'Review origin. MVP supports manual and demo records; external integrations are not included yet.';

create index if not exists reviews_business_created_at_idx
  on public.reviews (business_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Reviews are readable by their business owner" on public.reviews;
create policy "Reviews are readable by their business owner"
on public.reviews
for select
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = reviews.business_id
      and businesses.owner_id = (select auth.uid())
  )
);

revoke all on table public.reviews from anon;
revoke all on table public.reviews from authenticated;
grant select on table public.reviews to authenticated;

-- Idempotent demo data for the existing NuvoRate business.
-- If the business has a different name, replace the ILIKE condition below.
insert into public.reviews (
  business_id,
  author_name,
  rating,
  content,
  source,
  created_at
)
select
  business.id,
  seed.author_name,
  seed.rating,
  seed.content,
  'demo',
  now() - seed.age
from (
  select id
  from public.businesses
  where name ilike '%NuvoRate%'
  order by created_at
  limit 1
) as business
cross join (
  values
    (
      'Anna K.',
      5::smallint,
      'Świetna obsługa i bardzo miła atmosfera.',
      interval '2 hours'
    ),
    (
      'Marek P.',
      4::smallint,
      'Dobre miejsce. Krótki czas obsługi i miły zespół.',
      interval '1 day'
    ),
    (
      'Julia S.',
      2::smallint,
      'Na wizytę trzeba było czekać znacznie dłużej.',
      interval '2 days'
    )
) as seed(author_name, rating, content, age)
where not exists (
  select 1
  from public.reviews
  where reviews.business_id = business.id
    and reviews.source = 'demo'
    and reviews.author_name = seed.author_name
    and reviews.content = seed.content
);

commit;
