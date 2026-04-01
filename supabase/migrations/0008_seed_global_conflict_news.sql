-- Seed additional global news headlines, including conflict coverage.
-- Idempotent via slug upsert.

insert into public.categories (name, slug)
values
  ('News', 'news'),
  ('Politics', 'politics'),
  ('Business', 'business')
on conflict (slug) do update
set name = excluded.name;

with author as (
  select id
  from public.users
  order by created_at asc nulls last
  limit 1
),
seed_rows as (
  select *
  from (
    values
      (
        'Middle East war: Overnight strikes intensify as diplomatic talks continue',
        'middle-east-war-overnight-strikes-diplomatic-talks',
        'News',
        true,
        2120,
        6,
        now() - interval '20 minutes',
        'Regional fighting intensified overnight while mediators pushed for a temporary humanitarian pause and expanded aid corridors.'
      ),
      (
        'UN agencies warn of worsening humanitarian pressure across conflict zones',
        'un-agencies-warn-worsening-humanitarian-pressure-conflict-zones',
        'Politics',
        false,
        1380,
        5,
        now() - interval '1 hour',
        'Relief agencies said displacement and medical shortages are rising, urging faster access for food, fuel, and emergency care.'
      ),
      (
        'Oil and shipping markets react to renewed regional security risks',
        'oil-shipping-markets-react-renewed-regional-security-risks',
        'Business',
        true,
        1675,
        4,
        now() - interval '2 hours',
        'Energy benchmarks and freight insurance costs moved higher as traders reassessed supply-chain exposure and transit risks.'
      ),
      (
        'Ceasefire framework discussions resume with focus on hostages and aid access',
        'ceasefire-framework-discussions-resume-hostages-aid-access',
        'Politics',
        false,
        1210,
        5,
        now() - interval '3 hours',
        'Negotiators returned to framework talks centered on civilian protection, hostage releases, and monitored aid deliveries.'
      )
  ) as t(
    title,
    slug,
    category_name,
    is_breaking,
    views,
    read_time,
    published_at,
    content
  )
),
prepared as (
  select
    gen_random_uuid() as id,
    s.title,
    s.slug,
    s.content,
    left(s.content, 180) as summary,
    null::text as featured_image,
    a.id as author_id,
    c.id as category_id,
    'published'::text as status,
    s.views::bigint as views,
    s.is_breaking::boolean as is_breaking,
    s.published_at::timestamptz as published_at,
    array['middle-east', 'conflict', 'global']::text[] as tags,
    s.read_time::integer as read_time,
    null::text as video_url,
    null::text as video_provider,
    null::text as live_stream_url,
    case when s.is_breaking then 'breaking' else 'top' end as priority
  from seed_rows s
  join public.categories c on c.name = s.category_name
  cross join author a
)
insert into public.articles (
  id,
  title,
  slug,
  content,
  summary,
  featured_image,
  author_id,
  category_id,
  status,
  views,
  is_breaking,
  published_at,
  tags,
  read_time,
  video_url,
  video_provider,
  live_stream_url,
  priority
)
select
  id,
  title,
  slug,
  content,
  summary,
  featured_image,
  author_id,
  category_id,
  status,
  views,
  is_breaking,
  published_at,
  tags,
  read_time,
  video_url,
  video_provider,
  live_stream_url,
  priority
from prepared
on conflict (slug) do update
set
  title = excluded.title,
  content = excluded.content,
  summary = excluded.summary,
  category_id = excluded.category_id,
  status = excluded.status,
  views = excluded.views,
  is_breaking = excluded.is_breaking,
  published_at = excluded.published_at,
  tags = excluded.tags,
  read_time = excluded.read_time,
  priority = excluded.priority,
  updated_at = now();
