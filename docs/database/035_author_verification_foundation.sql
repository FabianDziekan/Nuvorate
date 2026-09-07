-- NuvoRate: per-location customer matching foundation for Google review authors.
-- This migration creates isolated customer/match storage only. It never calls
-- Google or OpenAI and does not modify existing reviews or AI billing data.

begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.reviews'::regclass
      and conname = 'reviews_id_business_unique'
  ) then
    alter table public.reviews
      add constraint reviews_id_business_unique unique (id, business_id);
  end if;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text not null,
  normalized_name text not null,
  email text,
  phone text,
  external_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_full_name_not_blank check (length(btrim(full_name)) > 0),
  constraint customers_normalized_name_not_blank check (length(btrim(normalized_name)) > 0),
  constraint customers_id_business_unique unique (id, business_id),
  constraint customers_business_external_id_unique unique (business_id, external_id)
);

create index if not exists customers_business_idx
  on public.customers (business_id, created_at desc);
create index if not exists customers_business_normalized_name_idx
  on public.customers (business_id, normalized_name);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create table if not exists public.review_author_matches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  review_id uuid not null,
  customer_id uuid,
  match_method text not null,
  match_status text not null,
  confidence_score integer,
  author_name_snapshot text not null,
  normalized_author_name text not null,
  decision_status text not null default 'undecided',
  decided_by uuid references public.profiles(user_id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint review_author_matches_review_unique unique (review_id),
  constraint review_author_matches_review_business_fk
    foreign key (review_id, business_id)
    references public.reviews (id, business_id)
    on delete cascade,
  constraint review_author_matches_customer_business_fk
    foreign key (customer_id, business_id)
    references public.customers (id, business_id)
    on delete cascade,
  constraint review_author_matches_method_valid
    check (match_method in ('exact_name', 'normalized_name', 'partial_name', 'none', 'anonymous')),
  constraint review_author_matches_status_valid
    check (match_status in ('matched', 'probable', 'no_match', 'insufficient_data')),
  constraint review_author_matches_customer_consistent
    check (
      (match_status = 'matched' and customer_id is not null)
      or (match_status in ('no_match', 'insufficient_data') and customer_id is null)
      or match_status = 'probable'
    ),
  constraint review_author_matches_confidence_valid
    check (confidence_score is null or confidence_score between 0 and 100),
  constraint review_author_matches_author_name_not_blank
    check (length(btrim(author_name_snapshot)) > 0),
  constraint review_author_matches_normalized_author_name_not_blank
    check (length(btrim(normalized_author_name)) > 0),
  constraint review_author_matches_decision_valid
    check (decision_status in ('undecided', 'confirmed', 'rejected')),
  constraint review_author_matches_decision_metadata_consistent
    check (
      (decision_status = 'undecided' and decided_by is null and decided_at is null)
      or (decision_status in ('confirmed', 'rejected') and decided_at is not null)
    ),
  constraint review_author_matches_confirmed_customer_required
    check (decision_status <> 'confirmed' or customer_id is not null)
);

create index if not exists review_author_matches_business_status_idx
  on public.review_author_matches (business_id, match_status, updated_at desc);
create index if not exists review_author_matches_customer_idx
  on public.review_author_matches (customer_id)
  where customer_id is not null;

drop trigger if exists review_author_matches_set_updated_at on public.review_author_matches;
create trigger review_author_matches_set_updated_at
before update on public.review_author_matches
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.review_author_matches enable row level security;

revoke all on table public.customers from anon, authenticated;
revoke all on table public.review_author_matches from anon, authenticated;
grant select on table public.customers to authenticated;
grant select on table public.review_author_matches to authenticated;
grant select, insert, update, delete on table public.customers to service_role;
grant select, insert, update, delete on table public.review_author_matches to service_role;

drop policy if exists "Members can read accessible customers" on public.customers;
drop policy if exists "Managers can manage accessible customers" on public.customers;
create policy "Members can read accessible customers"
on public.customers for select to authenticated
using (public.can_access_business(business_id));
create policy "Managers can manage accessible customers"
on public.customers for all to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

drop policy if exists "Members can read accessible review author matches" on public.review_author_matches;
drop policy if exists "Managers can manage accessible review author matches" on public.review_author_matches;
create policy "Members can read accessible review author matches"
on public.review_author_matches for select to authenticated
using (public.can_access_business(business_id));
create policy "Managers can manage accessible review author matches"
on public.review_author_matches for all to authenticated
using (public.can_manage_business(business_id))
with check (public.can_manage_business(business_id));

comment on table public.customers is
  'Per-business customer directory. Email and phone are contact data and are never used for Google author matching.';
comment on table public.review_author_matches is
  'One current, explainable customer-match result per review. It is not Google identity verification.';

commit;
