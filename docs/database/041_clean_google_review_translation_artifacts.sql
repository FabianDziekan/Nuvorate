-- Clean only the two confirmed, unambiguous parenthesized Google formats.
-- Apply after the application normalizer is deployed; do not rerun Google sync
-- as a substitute for this backfill.
begin;

do $$
declare
  review_row record;
  parts text[];
  clean_content text;
  notification_row record;
  payload jsonb;
  linked_review_id uuid;
  preview text;
begin
  for review_row in
    select id, content
    from public.reviews
    where source = 'google'
      and content ~* '\([[:blank:]]*translated[[:blank:]]+by[[:blank:]]+google[[:blank:]]*\)'
  loop
    clean_content := null;
    -- A: (Translated by Google) translation (Original) author text.
    parts := regexp_match(
      review_row.content,
      '^[[:space:]]*\([[:blank:]]*translated[[:blank:]]+by[[:blank:]]+google[[:blank:]]*\)[[:space:]]+(.+)[[:space:]]+\([[:blank:]]*original[[:blank:]]*\)[[:space:]]+(.+)[[:space:]]*$',
      'is'
    );
    if parts is not null
      and btrim(parts[1]) <> ''
      and btrim(parts[2]) <> ''
      and parts[1] !~* '\([[:blank:]]*(translated[[:blank:]]+by[[:blank:]]+google|original)[[:blank:]]*\)'
      and parts[2] !~* '\([[:blank:]]*(translated[[:blank:]]+by[[:blank:]]+google|original)[[:blank:]]*\)'
    then
      clean_content := btrim(parts[2]);
    else
      -- B: author text (Translated by Google) translation.
      parts := regexp_match(
        review_row.content,
        '^[[:space:]]*(.+)[[:space:]]+\([[:blank:]]*translated[[:blank:]]+by[[:blank:]]+google[[:blank:]]*\)[[:space:]]+(.+)[[:space:]]*$',
        'is'
      );
      if parts is not null
        and btrim(parts[1]) <> ''
        and btrim(parts[2]) <> ''
        and parts[1] !~* '\([[:blank:]]*(translated[[:blank:]]+by[[:blank:]]+google|original)[[:blank:]]*\)'
        and parts[2] !~* '\([[:blank:]]*(translated[[:blank:]]+by[[:blank:]]+google|original)[[:blank:]]*\)'
      then
        clean_content := btrim(parts[1]);
      end if;
    end if;

    if clean_content is not null and clean_content <> review_row.content then
      update public.reviews
      set content = clean_content
      where id = review_row.id
        and source = 'google'
        and content = review_row.content;
    end if;
  end loop;

  -- The old preview can be truncated before the marker. Rebuild it from the
  -- already-cleaned linked review; never infer an original from that preview.
  for notification_row in
    select id, business_id, message
    from public.notifications
    where type = 'new_review' and message is not null
  loop
    begin
      payload := notification_row.message::jsonb;
      if jsonb_typeof(payload) <> 'object' or not (payload ? 'contentPreview') then
        continue;
      end if;
      linked_review_id := (payload ->> 'reviewId')::uuid;
    exception when others then
      continue;
    end;

    select left(trim(regexp_replace(review.content, '\s+', ' ', 'g')), 120)
    into preview
    from public.reviews review
    where review.id = linked_review_id
      and review.business_id = notification_row.business_id
      and review.source = 'google';

    if found and payload ->> 'contentPreview' is distinct from preview then
      update public.notifications
      set message = jsonb_set(payload, '{contentPreview}', to_jsonb(preview), false)::text
      where id = notification_row.id
        and business_id = notification_row.business_id
        and type = 'new_review'
        and message = notification_row.message;
    end if;
  end loop;
end;
$$;

commit;
