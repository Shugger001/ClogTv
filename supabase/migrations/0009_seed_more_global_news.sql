-- Add a broader set of fresh headlines to enrich homepage/news sections.
-- Idempotent: upsert by slug.

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
      ('Central banks signal cautious path as inflation cools unevenly', 'central-banks-cautious-path-inflation-cools-unevenly', 'Business', false, 980, 4, now() - interval '40 minutes', 'Policy officials indicated rates may stay restrictive for longer in some regions despite slower headline inflation.'),
      ('Cybersecurity agencies issue coordinated alert on critical infrastructure threats', 'cybersecurity-agencies-coordinated-alert-critical-infrastructure', 'Technology', true, 1450, 5, now() - interval '55 minutes', 'National cybersecurity centers published joint advisories after detecting increased targeting of utility and transport systems.'),
      ('Parliament opens emergency session on border and refugee policy', 'parliament-emergency-session-border-refugee-policy', 'Politics', false, 870, 4, now() - interval '1 hour 20 minutes', 'Lawmakers convened an emergency debate focused on asylum processing capacity, border staffing, and regional burden-sharing.'),
      ('Major football clubs approve expanded international preseason calendar', 'major-football-clubs-expanded-international-preseason-calendar', 'Sports', false, 760, 3, now() - interval '1 hour 45 minutes', 'League stakeholders approved an expanded exhibition schedule aimed at broader global audiences and commercial partnerships.'),
      ('Studios accelerate premium short-form strategy for mobile-first audiences', 'studios-accelerate-premium-short-form-strategy-mobile-first', 'Entertainment', false, 690, 3, now() - interval '2 hours 10 minutes', 'Media executives said short-format premium programming is now central to growth targets on mobile video platforms.'),
      ('Flood warnings extended as heavy rain system tracks east overnight', 'flood-warnings-extended-heavy-rain-system-tracks-east-overnight', 'News', true, 1710, 4, now() - interval '25 minutes', 'Emergency services expanded flood alerts and advised residents in low-lying areas to prepare for possible evacuations.'),
      ('Global shipping insurers revise premiums after maritime disruption concerns', 'global-shipping-insurers-revise-premiums-maritime-disruption-concerns', 'Business', false, 920, 4, now() - interval '2 hours 40 minutes', 'Insurers updated risk models for selected routes, raising short-term premiums amid persistent security uncertainty.'),
      ('AI model audit standards proposed by cross-border regulatory working group', 'ai-model-audit-standards-proposed-cross-border-regulatory-group', 'Technology', false, 835, 5, now() - interval '3 hours', 'A new framework proposes independent safety audits, disclosure baselines, and incident reporting for frontier AI systems.'),
      ('Regional ceasefire monitors report mixed compliance in first 24 hours', 'regional-ceasefire-monitors-report-mixed-compliance-first-24-hours', 'Politics', true, 1605, 5, now() - interval '1 hour 5 minutes', 'Observers reported reduced shelling in several corridors but documented violations in contested zones overnight.'),
      ('Record turnout expected for continental athletics championships opening weekend', 'record-turnout-expected-continental-athletics-championships-weekend', 'Sports', false, 640, 3, now() - interval '3 hours 30 minutes', 'Organizers forecast record attendance and streaming numbers as multiple medal favorites headline opening events.')
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
    array['world', lower(replace(s.category_name, ' ', '-'))]::text[] as tags,
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
  id, title, slug, content, summary, featured_image, author_id, category_id, status, views,
  is_breaking, published_at, tags, read_time, video_url, video_provider, live_stream_url, priority
)
select
  id, title, slug, content, summary, featured_image, author_id, category_id, status, views,
  is_breaking, published_at, tags, read_time, video_url, video_provider, live_stream_url, priority
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
