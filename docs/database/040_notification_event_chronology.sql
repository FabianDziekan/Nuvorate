-- Keep delivery time (created_at) separate from the business event time.
begin;

alter table public.notifications
  add column if not exists occurred_at timestamptz;

-- Legacy payloads are text. Parse each defensively: malformed JSON, missing or
-- invalid reviewId, and deleted/cross-business reviews retain the fallback.
do $$
declare
  notification_row record;
  review_id uuid;
begin
  for notification_row in
    select id, business_id, message
    from public.notifications
    where type = 'new_review'
      and occurred_at is null
      and message is not null
  loop
    begin
      review_id := (notification_row.message::jsonb ->> 'reviewId')::uuid;
    exception when others then
      review_id := null;
    end;

    if review_id is not null then
      update public.notifications notification
      set occurred_at = review.created_at
      from public.reviews review
      where notification.id = notification_row.id
        and notification.business_id = notification_row.business_id
        and review.id = review_id
        and review.business_id = notification_row.business_id
        and notification.occurred_at is null;
    end if;
  end loop;
end;
$$;

update public.notifications
set occurred_at = created_at
where occurred_at is null;

alter table public.notifications
  alter column occurred_at set default now(),
  alter column occurred_at set not null;

create or replace function public.create_new_review_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_content text;
begin
  normalized_content := trim(regexp_replace(coalesce(new.content, ''), '\s+', ' ', 'g'));

  insert into public.notifications (
    business_id,
    type,
    title,
    message,
    occurred_at
  )
  values (
    new.business_id,
    'new_review',
    'Nowa opinia',
    jsonb_build_object(
      'reviewId', new.id,
      'authorName', new.author_name,
      'rating', new.rating,
      'contentPreview', left(normalized_content, 120)
    )::text,
    new.created_at
  );

  return new;
end;
$$;

create index if not exists notifications_new_review_event_order_idx
  on public.notifications (business_id, occurred_at desc, created_at desc, id desc)
  where type = 'new_review';

commit;
