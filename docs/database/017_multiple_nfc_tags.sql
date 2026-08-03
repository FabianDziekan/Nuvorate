-- NuvoRate: allow multiple NFC tags per business.
-- Run after 016_nfc_tags_and_scans.sql in the Supabase SQL Editor.

begin;

-- 016 used a unique business_id for the first, single-tag version. Dropping
-- only this constraint preserves all tags, public tokens and scan history.
alter table public.nfc_tags
  drop constraint if exists nfc_tags_business_id_key;

create index if not exists nfc_tags_business_created_at_idx
  on public.nfc_tags (business_id, created_at desc);

commit;
