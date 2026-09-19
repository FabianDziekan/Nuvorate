-- NuvoRate: manual Supabase scheduler setup for durable automatic analysis.
-- Run only after 037 and after AUTOMATIC_ANALYSIS_WORKER_SECRET is configured
-- in the Production app environment. This script never calls the endpoint
-- directly; pg_cron invokes it only on its next natural 15-minute tick.

begin;

create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault with schema vault;

do $$
declare
  v_worker_secret text := '__WKLEJ_TUTAJ_AUTOMATIC_ANALYSIS_WORKER_SECRET__';
begin
  if length(coalesce(v_worker_secret, '')) < 32 then
    raise exception 'Wklej bezpieczny AUTOMATIC_ANALYSIS_WORKER_SECRET przed uruchomieniem SQL.';
  end if;

  delete from vault.secrets
  where name in ('automatic_analysis_worker_secret', 'automatic_analysis_worker_target_url');

  perform vault.create_secret(
    v_worker_secret,
    'automatic_analysis_worker_secret',
    'Bearer secret for NuvoRate automatic Business-analysis worker.'
  );
  perform vault.create_secret(
    'https://www.nuvorate.pl/api/cron/automatic-analysis',
    'automatic_analysis_worker_target_url',
    'Production endpoint for NuvoRate automatic Business-analysis worker.'
  );
end;
$$;

select cron.unschedule(jobid)
from cron.job
where jobname = 'nuvorate-automatic-business-analysis-every-15-minutes';

select cron.schedule(
  'nuvorate-automatic-business-analysis-every-15-minutes',
  '*/15 * * * *',
  $cron$
    select net.http_post(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'automatic_analysis_worker_target_url'
        limit 1
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'automatic_analysis_worker_secret'
          limit 1
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 60000
    );
  $cron$
);

commit;
