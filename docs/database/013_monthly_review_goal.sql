alter table public.businesses
add column if not exists monthly_review_goal integer not null default 30;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'businesses_monthly_review_goal_check'
  ) then
    alter table public.businesses
    add constraint businesses_monthly_review_goal_check
    check (monthly_review_goal between 1 and 1000);
  end if;
end $$;
