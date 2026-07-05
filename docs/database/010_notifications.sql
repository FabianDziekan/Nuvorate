create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (
    type in (
      'new_review',
      'analysis_ready',
      'response_generated',
      'limit_warning',
      'subscription'
    )
  ),
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_business_created_at_idx
  on public.notifications (business_id, created_at desc);

create index if not exists notifications_business_unread_idx
  on public.notifications (business_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Owners can read own notifications" on public.notifications;
create policy "Owners can read own notifications"
  on public.notifications
  for select
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = notifications.business_id
        and b.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners can update own notifications" on public.notifications;
create policy "Owners can update own notifications"
  on public.notifications
  for update
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = notifications.business_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = notifications.business_id
        and b.owner_id = auth.uid()
    )
  );

create or replace function public.create_new_review_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    business_id,
    type,
    title,
    message
  )
  values (
    new.business_id,
    'new_review',
    'Nowa opinia',
    jsonb_build_object(
      'reviewId', new.id,
      'authorName', new.author_name,
      'rating', new.rating,
      'contentPreview', left(regexp_replace(coalesce(new.content, ''), '\s+', ' ', 'g'), 120)
    )::text
  );

  return new;
end;
$$;

drop trigger if exists reviews_create_notification on public.reviews;
create trigger reviews_create_notification
  after insert on public.reviews
  for each row
  execute function public.create_new_review_notification();
