-- NuvoRate: safe scheduling state for automatic Google review synchronization.
-- Run manually after the deployed application contains the shared Google review
-- sync service and internal endpoint. This migration intentionally DOES NOT
-- create a pg_cron job or call pg_net.

begin;

alter table public.google_business_connections
  add column if not exists last_synced_at timestamptz,
  add column if not exists sync_started_at timestamptz,
  add column if not exists sync_lease_expires_at timestamptz,
  add column if not exists sync_lease_token uuid;

comment on column public.google_business_connections.last_synced_at is
  'Timestamp of the last successful Google review and owner-reply synchronization.';

comment on column public.google_business_connections.sync_started_at is
  'Timestamp when the current Google synchronization lease was claimed.';

comment on column public.google_business_connections.sync_lease_expires_at is
  'Expiry of a temporary synchronization lease. Expired leases are eligible for safe retry.';

comment on column public.google_business_connections.sync_lease_token is
  'Unique worker token required to finish or fail the current synchronization lease.';

create index if not exists google_business_connections_sync_queue_idx
  on public.google_business_connections (last_synced_at asc nulls first, updated_at asc, id)
  where status = 'connected';

-- Claims a small, oldest-first batch. FOR UPDATE SKIP LOCKED prevents two
-- workers from claiming one connection, while the caller-supplied lease token
-- prevents an expired worker from finishing a newer worker's lease.
create or replace function public.claim_google_review_sync_connections(
  p_limit integer,
  p_lease_seconds integer,
  p_lease_token uuid,
  p_business_id uuid default null
)
returns table (
  connection_id uuid,
  business_id uuid,
  google_account_id text,
  google_location_id text,
  encrypted_refresh_token text,
  sync_lease_token uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 25 then
    raise exception 'Google review sync batch size must be between 1 and 25'
      using errcode = '22023';
  end if;

  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'Google review sync lease must be between 30 and 3600 seconds'
      using errcode = '22023';
  end if;

  if p_lease_token is null then
    raise exception 'Google review sync lease token is required'
      using errcode = '22023';
  end if;

  return query
  with candidates as materialized (
    select connection.id
    from public.google_business_connections as connection
    where connection.status = 'connected'
      and (p_business_id is null or connection.business_id = p_business_id)
      and (
        connection.sync_lease_expires_at is null
        or connection.sync_lease_expires_at <= pg_catalog.clock_timestamp()
      )
    order by connection.last_synced_at asc nulls first, connection.updated_at asc, connection.id asc
    for update skip locked
    limit p_limit
  ),
  claimed as (
    update public.google_business_connections as connection
    set
      sync_started_at = pg_catalog.clock_timestamp(),
      sync_lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds),
      sync_lease_token = p_lease_token
    from candidates
    where connection.id = candidates.id
    returning
      connection.id,
      connection.business_id,
      connection.google_account_id,
      connection.google_location_id,
      connection.encrypted_refresh_token,
      connection.sync_lease_token
  )
  select
    claimed.id,
    claimed.business_id,
    claimed.google_account_id,
    claimed.google_location_id,
    claimed.encrypted_refresh_token,
    claimed.sync_lease_token
  from claimed;
end;
$$;

-- A stale worker cannot complete a lease that has been reclaimed with a new
-- token. A successful synchronization restores the connection to connected
-- and clears only the synchronization error state.
create or replace function public.complete_google_review_sync_connection(
  p_connection_id uuid,
  p_lease_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_connection_id is null or p_lease_token is null then
    raise exception 'Google review sync connection and lease token are required'
      using errcode = '22023';
  end if;

  update public.google_business_connections as connection
  set
    last_error = null,
    last_synced_at = pg_catalog.clock_timestamp(),
    status = 'connected',
    sync_lease_expires_at = null,
    sync_lease_token = null
  where connection.id = p_connection_id
    and connection.sync_lease_token = p_lease_token
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- A worker renews immediately before writing local review state. The token and
-- unexpired-lease checks stop a stale worker from writing after a newer worker
-- has reclaimed the connection.
create or replace function public.renew_google_review_sync_connection(
  p_connection_id uuid,
  p_lease_token uuid,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_connection_id is null or p_lease_token is null then
    raise exception 'Google review sync connection and lease token are required'
      using errcode = '22023';
  end if;

  if p_lease_seconds is null or p_lease_seconds < 30 or p_lease_seconds > 3600 then
    raise exception 'Google review sync lease must be between 30 and 3600 seconds'
      using errcode = '22023';
  end if;

  update public.google_business_connections as connection
  set sync_lease_expires_at = pg_catalog.clock_timestamp() + pg_catalog.make_interval(secs => p_lease_seconds)
  where connection.id = p_connection_id
    and connection.sync_lease_token = p_lease_token
    and connection.sync_lease_expires_at > pg_catalog.clock_timestamp()
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

-- Transient failures remain eligible for the next scheduled retry. Only errors
-- that require user action mark the connection as error. The error text is
-- supplied by trusted server code and truncated again in the database.
create or replace function public.fail_google_review_sync_connection(
  p_connection_id uuid,
  p_lease_token uuid,
  p_last_error text,
  p_requires_reconnect boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_updated boolean := false;
begin
  if p_connection_id is null or p_lease_token is null then
    raise exception 'Google review sync connection and lease token are required'
      using errcode = '22023';
  end if;

  update public.google_business_connections as connection
  set
    last_error = left(
      coalesce(nullif(btrim(p_last_error), ''), 'Nie udało się zsynchronizować opinii Google.'),
      240
    ),
    status = case when coalesce(p_requires_reconnect, false) then 'error' else 'connected' end,
    sync_lease_expires_at = null,
    sync_lease_token = null
  where connection.id = p_connection_id
    and connection.sync_lease_token = p_lease_token
  returning true into v_updated;

  return coalesce(v_updated, false);
end;
$$;

revoke all on function public.claim_google_review_sync_connections(integer, integer, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.complete_google_review_sync_connection(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.renew_google_review_sync_connection(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.fail_google_review_sync_connection(uuid, uuid, text, boolean)
  from public, anon, authenticated;

grant execute on function public.claim_google_review_sync_connections(integer, integer, uuid, uuid)
  to service_role;
grant execute on function public.complete_google_review_sync_connection(uuid, uuid)
  to service_role;
grant execute on function public.renew_google_review_sync_connection(uuid, uuid, integer)
  to service_role;
grant execute on function public.fail_google_review_sync_connection(uuid, uuid, text, boolean)
  to service_role;

commit;
