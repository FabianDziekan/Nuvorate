begin;

create table if not exists public.support_request_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 0 check (submission_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.support_request_rate_limits enable row level security;

create or replace function public.claim_support_request_slot()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    return false;
  end if;

  insert into public.support_request_rate_limits (
    user_id,
    window_started_at,
    submission_count,
    updated_at
  )
  values (requester_id, now(), 1, now())
  on conflict (user_id) do update
    set
      window_started_at = case
        when public.support_request_rate_limits.window_started_at <= now() - interval '15 minutes'
          then now()
        else public.support_request_rate_limits.window_started_at
      end,
      submission_count = case
        when public.support_request_rate_limits.window_started_at <= now() - interval '15 minutes'
          then 1
        else public.support_request_rate_limits.submission_count + 1
      end,
      updated_at = now()
    where public.support_request_rate_limits.window_started_at <= now() - interval '15 minutes'
       or public.support_request_rate_limits.submission_count < 5;

  return found;
end;
$$;

revoke all on function public.claim_support_request_slot() from public;
grant execute on function public.claim_support_request_slot() to authenticated;

commit;
