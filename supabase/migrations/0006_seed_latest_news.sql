-- Seed latest newsroom content for homepage and discovery pages.
-- Safe to run multiple times (upserts by slug).

insert into public.categories (name, slug)
values
  ('News', 'news'),
  ('Politics', 'politics'),
  ('Entertainment', 'entertainment'),
  ('Sports', 'sports'),
  ('Business', 'business'),
  ('Technology', 'technology')
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
        'Global Markets Rally After Central Bank Signals Gradual Rate Cuts',
        'global-markets-rally-rate-cut-signal',
        'Business',
        'published',
        true,
        1280,
        5,
        now() - interval '1 hour',
        'Markets responded positively to updated guidance, with equities and sovereign bonds gaining through the session.'
      ),
      (
        'Election Watch: Coalition Talks Enter Critical Final Round',
        'election-watch-coalition-talks-final-round',
        'Politics',
        'published',
        false,
        940,
        4,
        now() - interval '2 hours',
        'Negotiators met overnight to finalize cabinet allocations as parliamentary leaders prepare for a confidence vote.'
      ),
      (
        'Championship Night: Late Winner Sends City Into Celebration',
        'championship-night-late-winner-city-celebrates',
        'Sports',
        'published',
        false,
        860,
        3,
        now() - interval '3 hours',
        'A dramatic stoppage-time goal sealed the title, sparking celebrations across the city center.'
      ),
      (
        'Streaming Giants Announce Joint Production Slate for 2026',
        'streaming-giants-announce-joint-slate-2026',
        'Entertainment',
        'published',
        false,
        690,
        4,
        now() - interval '4 hours',
        'Studios unveiled a shared release calendar focused on international co-productions and documentary series.'
      ),
      (
        'AI Infrastructure Spend Accelerates as Chip Demand Surges',
        'ai-infrastructure-spend-chip-demand-surges',
        'Technology',
        'published',
        true,
        1175,
        6,
        now() - interval '5 hours',
        'Cloud providers increased capital expenditure plans, citing stronger enterprise demand for AI workloads.'
      ),
      (
        'Severe Weather Alert Expanded Across Coastal Regions',
        'severe-weather-alert-expanded-coastal-regions',
        'News',
        'published',
        true,
        1530,
        3,
        now() - interval '30 minutes',
        'Emergency agencies expanded warnings and advised residents in vulnerable zones to follow local evacuation guidance.'
      )
  ) as t(
    title,
    slug,
    category_name,
    status,
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
    null::text as featured_image,
    a.id as author_id,
    c.id as category_id,
    s.status::text as status,
    s.views::bigint as views,
    s.is_breaking::boolean as is_breaking,
    s.published_at::timestamptz as published_at,
    array[]::text[] as tags,
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
  category_id = excluded.category_id,
  status = excluded.status,
  views = excluded.views,
  is_breaking = excluded.is_breaking,
  published_at = excluded.published_at,
  read_time = excluded.read_time,
  priority = excluded.priority,
  updated_at = now();
