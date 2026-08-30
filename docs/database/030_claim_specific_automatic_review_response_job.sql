-- NuvoRate: controlled, service-role-only claim for one automatic response job.
-- Run manually after 029. This migration does not create a cron job.

begin;

create or replace function public.claim_specific_automatic_review_response_job(
  p_job_id uuid,
  p_lease_seconds integer,
  p_lease_token uuid
)
returns table (
  job_id uuid,
  business_id uuid,
  review_id uuid,
  billing_owner_id uuid,
  ai_usage_reservation_id uuid,
  lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_job_id is null then
    raise exception 'Automatic response job id is required' using errcode = '22023';
  end if;
  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 or p_lease_token is null then
    raise exception 'Automatic response lease is invalid' using errcode = '22023';
  end if;

  -- Terminalize only this exhausted job. No unrelated queue row is inspected
  -- or claimed by this specific-job operation.
  update public.automatic_review_response_jobs as exhausted
  set
    status = 'failed',
    lease_token = null,
    lease_expires_at = null,
    last_error = 'attempt_limit_reached',
    updated_at = pg_catalog.clock_timestamp()
  where exhausted.id = p_job_id
    and exhausted.status = 'processing'
    and exhausted.lease_expires_at <= pg_catalog.clock_timestamp()
    and exhausted.attempt_count >= 3;

  return query
  with candidate as materialized (
    select job.id
    from public.automatic_review_response_jobs as job
    where job.id = p_job_id
      and job.attempt_count < 3
      and (
        job.status = 'pending'
        or job.status = 'failed'
        or (job.status = 'processing' and job.lease_expires_at <= pg_catalog.clock_timestamp())
      )
    for update skip locked
  ), claimed as (
    update public.automatic_review_response_jobs as job
    set
      status = 'processing',
      lease_token = p_lease_token,
      lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
      attempt_count = job.attempt_count + 1,
      last_error = null,
      updated_at = pg_catalog.clock_timestamp()
    from candidate
    where job.id = candidate.id
    returning job.id, job.business_id, job.review_id, job.billing_owner_id, job.ai_usage_reservation_id, job.lease_token
  )
  select claimed.id, claimed.business_id, claimed.review_id, claimed.billing_owner_id, claimed.ai_usage_reservation_id, claimed.lease_token
  from claimed;
end;
$$;

revoke all on function public.claim_specific_automatic_review_response_job(uuid, integer, uuid)
  from public, anon, authenticated;
grant execute on function public.claim_specific_automatic_review_response_job(uuid, integer, uuid)
  to service_role;

commit;
