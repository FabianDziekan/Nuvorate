-- NuvoRate: controlled, service-role-only claim for one automatic Google publication job.
-- Run manually after 032. This migration does not call Google or OpenAI.

begin;

create or replace function public.claim_specific_automatic_review_response_publication_job(
  p_job_id uuid,
  p_lease_seconds integer,
  p_lease_token uuid
)
returns table (
  job_id uuid,
  business_id uuid,
  review_id uuid,
  billing_owner_id uuid,
  publication_lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_job_id is null then
    raise exception 'Automatic publication job id is required' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 or p_lease_token is null then
    raise exception 'Automatic publication lease is invalid' using errcode = '22023';
  end if;

  -- Terminalize only this exhausted job. No unrelated queue row is inspected
  -- or claimed by this specific-job operation.
  update public.automatic_review_response_jobs as exhausted
  set
    publication_status = 'terminal_failed',
    publication_lease_token = null,
    publication_lease_expires_at = null,
    publication_last_error = 'publication_attempt_limit_reached',
    updated_at = pg_catalog.clock_timestamp()
  where exhausted.id = p_job_id
    and exhausted.publication_status = 'processing'
    and exhausted.publication_lease_expires_at <= pg_catalog.clock_timestamp()
    and exhausted.publication_attempt_count >= 3;

  return query
  with candidate as materialized (
    select job.id
    from public.automatic_review_response_jobs as job
    join public.ai_usage_reservations as reservation
      on reservation.id = job.ai_usage_reservation_id
      and reservation.status = 'completed'
    join public.reviews as review
      on review.id = job.review_id
      and review.business_id = job.business_id
    join public.business_response_settings as settings
      on settings.business_id = job.business_id
    where job.id = p_job_id
      and job.status = 'completed'
      and job.publication_attempt_count < 3
      and settings.auto_generate = true
      and settings.auto_publish = true
      and review.source = 'google'
      and review.google_review_id is not null
      and review.rating = any(settings.enabled_ratings)
      and review.response_status = 'ready'
      and coalesce(nullif(btrim(review.response_text), ''), '') <> ''
      and review.response_published_at is null
      and (
        job.publication_status = 'pending'
        or job.publication_status = 'retryable_failed'
        or (job.publication_status = 'processing' and job.publication_lease_expires_at <= pg_catalog.clock_timestamp())
      )
    for update of job skip locked
  ), claimed as (
    update public.automatic_review_response_jobs as job
    set
      publication_status = 'processing',
      publication_lease_token = p_lease_token,
      publication_lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
      publication_attempt_count = job.publication_attempt_count + 1,
      publication_last_attempt_at = pg_catalog.clock_timestamp(),
      publication_last_error = null,
      updated_at = pg_catalog.clock_timestamp()
    from candidate
    where job.id = candidate.id
    returning job.id, job.business_id, job.review_id, job.billing_owner_id, job.publication_lease_token
  )
  select claimed.id, claimed.business_id, claimed.review_id, claimed.billing_owner_id, claimed.publication_lease_token
  from claimed;
end;
$$;

revoke all on function public.claim_specific_automatic_review_response_publication_job(uuid, integer, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_specific_automatic_review_response_publication_job(uuid, integer, uuid)
  to service_role;

commit;
