-- NuvoRate: aggregated review activity trend
-- Run this file in the Supabase SQL Editor after 002_reviews.sql.

begin;

create or replace function public.get_review_activity_trend(
  p_business_id uuid,
  p_range text default '30d'
)
returns table (
  period_start date,
  period_end date,
  review_count bigint,
  average_rating numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with params as (
    select
      case
        when p_range = '3m' then '3m'
        when p_range = '12m' then '12m'
        else '30d'
      end as selected_range
  ),
  buckets as (
    select
      day::date as period_start,
      day::date as period_end
    from params
    cross join generate_series(
      current_date - interval '29 days',
      current_date,
      interval '1 day'
    ) as day
    where params.selected_range = '30d'

    union all

    select
      week_start::date as period_start,
      least((week_start + interval '6 days')::date, current_date) as period_end
    from params
    cross join generate_series(
      date_trunc('week', current_date - interval '3 months')::date,
      date_trunc('week', current_date)::date,
      interval '1 week'
    ) as week_start
    where params.selected_range = '3m'

    union all

    select
      month_start::date as period_start,
      least(
        (month_start + interval '1 month - 1 day')::date,
        current_date
      ) as period_end
    from params
    cross join generate_series(
      date_trunc('month', current_date - interval '11 months')::date,
      date_trunc('month', current_date)::date,
      interval '1 month'
    ) as month_start
    where params.selected_range = '12m'
  )
  select
    buckets.period_start,
    buckets.period_end,
    count(reviews.id)::bigint as review_count,
    avg(reviews.rating)::numeric(3, 2) as average_rating
  from buckets
  left join public.reviews
    on reviews.business_id = p_business_id
   and reviews.created_at >= buckets.period_start::timestamptz
   and reviews.created_at < (buckets.period_end + 1)::timestamptz
  group by buckets.period_start, buckets.period_end
  order by buckets.period_start;
$$;

revoke all on function public.get_review_activity_trend(uuid, text) from public;
grant execute on function public.get_review_activity_trend(uuid, text) to authenticated;

commit;
