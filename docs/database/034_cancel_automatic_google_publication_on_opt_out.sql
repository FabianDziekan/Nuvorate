-- NuvoRate: keep already-created AI drafts local after automatic publication is disabled.
-- Run manually after 032 and 033. This migration never calls Google or OpenAI.

begin;

alter table public.automatic_review_response_jobs
  drop constraint if exists automatic_review_response_jobs_publication_status_valid;

alter table public.automatic_review_response_jobs
  add constraint automatic_review_response_jobs_publication_status_valid
    check (publication_status in (
      'not_requested',
      'pending',
      'processing',
      'completed',
      'retryable_failed',
      'terminal_failed',
      'cancelled'
    ));

-- The transition is handled in the same transaction as the settings update.
-- Only work still waiting in the automatic-publication queue is cancelled.
-- In-flight work retains its lease and performs its existing final opt-in check
-- immediately before the Google PUT.
create or replace function public.cancel_pending_automatic_review_response_publications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.automatic_review_response_jobs as job
  set
    publication_status = 'cancelled',
    publication_last_error = 'auto_publish_disabled',
    publication_lease_token = null,
    publication_lease_expires_at = null,
    updated_at = pg_catalog.clock_timestamp()
  where job.business_id = new.business_id
    and job.publication_status in ('pending', 'retryable_failed');

  return new;
end;
$$;

drop trigger if exists business_response_settings_cancel_pending_automatic_publications
  on public.business_response_settings;

create trigger business_response_settings_cancel_pending_automatic_publications
after update of auto_publish on public.business_response_settings
for each row
when (old.auto_publish is true and new.auto_publish is false)
execute function public.cancel_pending_automatic_review_response_publications();

revoke all on function public.cancel_pending_automatic_review_response_publications()
  from public, anon, authenticated;
grant execute on function public.cancel_pending_automatic_review_response_publications()
  to service_role;

commit;
