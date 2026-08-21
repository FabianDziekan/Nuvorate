-- NuvoRate: enforce NFC scan ownership integrity.
-- Run manually after 023_business_location_entitlements.sql.
-- Every nfc_scans.business_id must belong to the same business as its nfc_tags row.

begin;

-- A composite reference needs a matching unique key on the tag table. The
-- primary key on id already makes this pair unique in practice; this explicit
-- key lets PostgreSQL enforce the tag/business relationship declaratively.
do $$
declare
  v_tag_id_attnum smallint;
  v_tag_business_id_attnum smallint;
begin
  select attribute.attnum
  into v_tag_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_tags'::regclass
    and attribute.attname = 'id'
    and not attribute.attisdropped;

  select attribute.attnum
  into v_tag_business_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_tags'::regclass
    and attribute.attname = 'business_id'
    and not attribute.attisdropped;

  if v_tag_id_attnum is null or v_tag_business_id_attnum is null then
    raise exception 'Expected public.nfc_tags.id and public.nfc_tags.business_id';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_index index_entry
    where index_entry.indrelid = 'public.nfc_tags'::regclass
      and index_entry.indisunique
      and index_entry.indpred is null
      and index_entry.indkey::smallint[] = array[v_tag_id_attnum, v_tag_business_id_attnum]::smallint[]
  ) then
    alter table public.nfc_tags
      add constraint nfc_tags_id_business_id_unique unique (id, business_id);
  end if;
end
$$;

-- Replace the legacy tag-only foreign key with a composite FK. The structural
-- checks intentionally fail on an unexpected schema rather than silently
-- accepting a partially migrated or differently constrained database.
do $$
declare
  v_scan_tag_id_attnum smallint;
  v_scan_business_id_attnum smallint;
  v_tag_id_attnum smallint;
  v_tag_business_id_attnum smallint;
  v_legacy_fk_name name;
  v_legacy_fk_count integer;
  v_composite_fk_count integer;
  v_composite_delete_action "char";
begin
  select attribute.attnum into v_scan_tag_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_scans'::regclass
    and attribute.attname = 'tag_id'
    and not attribute.attisdropped;

  select attribute.attnum into v_scan_business_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_scans'::regclass
    and attribute.attname = 'business_id'
    and not attribute.attisdropped;

  select attribute.attnum into v_tag_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_tags'::regclass
    and attribute.attname = 'id'
    and not attribute.attisdropped;

  select attribute.attnum into v_tag_business_id_attnum
  from pg_catalog.pg_attribute attribute
  where attribute.attrelid = 'public.nfc_tags'::regclass
    and attribute.attname = 'business_id'
    and not attribute.attisdropped;

  if v_scan_tag_id_attnum is null
    or v_scan_business_id_attnum is null
    or v_tag_id_attnum is null
    or v_tag_business_id_attnum is null
  then
    raise exception 'Expected NFC scan/tag ownership columns are missing';
  end if;

  select count(*), min(constraint_entry.conname)
  into v_legacy_fk_count, v_legacy_fk_name
  from pg_catalog.pg_constraint constraint_entry
  where constraint_entry.conrelid = 'public.nfc_scans'::regclass
    and constraint_entry.contype = 'f'
    and constraint_entry.conkey = array[v_scan_tag_id_attnum]::smallint[]
    and constraint_entry.confrelid = 'public.nfc_tags'::regclass
    and constraint_entry.confkey = array[v_tag_id_attnum]::smallint[]
    and constraint_entry.confdeltype = 'c';

  select count(*), min(constraint_entry.confdeltype)
  into v_composite_fk_count, v_composite_delete_action
  from pg_catalog.pg_constraint constraint_entry
  where constraint_entry.conrelid = 'public.nfc_scans'::regclass
    and constraint_entry.contype = 'f'
    and constraint_entry.conkey = array[v_scan_tag_id_attnum, v_scan_business_id_attnum]::smallint[]
    and constraint_entry.confrelid = 'public.nfc_tags'::regclass
    and constraint_entry.confkey = array[v_tag_id_attnum, v_tag_business_id_attnum]::smallint[];

  if v_composite_fk_count > 1 then
    raise exception 'Expected at most one composite NFC scan/tag foreign key, found %', v_composite_fk_count;
  end if;

  if v_composite_fk_count = 1 then
    if v_composite_delete_action <> 'c' then
      raise exception 'Existing composite NFC scan/tag foreign key must use ON DELETE CASCADE';
    end if;

    if v_legacy_fk_count <> 0 then
      raise exception 'Both legacy and composite NFC scan/tag foreign keys exist';
    end if;

    return;
  end if;

  if v_legacy_fk_count <> 1 then
    raise exception 'Expected exactly one legacy nfc_scans.tag_id foreign key, found %', v_legacy_fk_count;
  end if;

  execute format(
    'alter table public.nfc_scans drop constraint %I',
    v_legacy_fk_name
  );

  alter table public.nfc_scans
    add constraint nfc_scans_tag_business_fkey
    foreign key (tag_id, business_id)
    references public.nfc_tags (id, business_id)
    on delete cascade;
end
$$;

commit;
