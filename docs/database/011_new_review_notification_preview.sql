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
