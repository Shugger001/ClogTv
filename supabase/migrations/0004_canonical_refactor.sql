alter table public.users
  add column if not exists created_at timestamptz not null default now();

alter table public.articles
  add column if not exists tags text[] not null default '{}',
  add column if not exists read_time integer not null default 1,
  add column if not exists video_url text,
  add column if not exists video_provider text,
  add column if not exists live_stream_url text,
  add column if not exists priority text not null default 'top',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_articles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
before update on public.articles
for each row execute function public.set_articles_updated_at();

insert into public.users (id, name, role, avatar_url)
select
  p.id,
  p.full_name,
  case when p.role = 'reporter' then 'journalist' else p.role end,
  null
from public.profiles p
on conflict (id) do update
set
  name = excluded.name,
  role = excluded.role;

insert into public.categories(name, slug)
select distinct category, lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g'))
from public.news_articles
where category is not null
on conflict (slug) do nothing;

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
  priority,
  created_at,
  updated_at
)
select
  na.id,
  na.title,
  na.slug,
  coalesce(na.content, na.body, ''),
  na.featured_image,
  na.author_id,
  c.id,
  na.status::text,
  coalesce(na.views, 0),
  coalesce(na.is_breaking, false),
  na.published_at,
  coalesce(na.tags, '{}'),
  coalesce(na.read_time, 1),
  na.video_url,
  na.video_provider,
  na.live_stream_url,
  coalesce(na.priority::text, 'top'),
  na.created_at,
  coalesce(na.updated_at, na.created_at)
from public.news_articles na
left join public.categories c on c.name = na.category
on conflict (id) do update
set
  title = excluded.title,
  slug = excluded.slug,
  content = excluded.content,
  featured_image = excluded.featured_image,
  author_id = excluded.author_id,
  category_id = excluded.category_id,
  status = excluded.status,
  views = excluded.views,
  is_breaking = excluded.is_breaking,
  published_at = excluded.published_at,
  tags = excluded.tags,
  read_time = excluded.read_time,
  video_url = excluded.video_url,
  video_provider = excluded.video_provider,
  live_stream_url = excluded.live_stream_url,
  priority = excluded.priority,
  updated_at = now();

insert into public.media(id, url, type, uploaded_by)
select
  ma.id,
  ma.storage_path,
  case when ma.mime_type like 'video/%' then 'video' else 'image' end,
  ma.uploaded_by
from public.media_assets ma
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'journalist',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.increment_article_views(article_slug text, viewer uuid, session text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from public.articles where slug = article_slug limit 1;
  if target_id is null then
    return;
  end if;

  update public.articles
  set views = views + 1
  where id = target_id;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles_legacy'
  ) then
    alter table public.profiles rename to profiles_legacy;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'news_articles'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'news_articles_legacy'
  ) then
    alter table public.news_articles rename to news_articles_legacy;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'media_assets'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'media_assets_legacy'
  ) then
    alter table public.media_assets rename to media_assets_legacy;
  end if;
end $$;

drop view if exists public.profiles;
create view public.profiles as
select
  u.id,
  u.name as full_name,
  u.role::public.user_role as role,
  u.created_at
from public.users u;

drop view if exists public.news_articles;
create view public.news_articles as
select
  a.id,
  a.title,
  a.slug,
  null::text as standfirst,
  a.content as body,
  a.content,
  a.featured_image,
  coalesce(c.name, 'News') as category,
  a.status::public.article_status as status,
  a.priority::public.article_priority as priority,
  a.live_stream_url,
  a.author_id,
  a.published_at,
  a.created_at,
  a.updated_at,
  a.tags,
  a.is_breaking,
  a.views,
  a.read_time,
  a.video_url,
  a.video_provider
from public.articles a
left join public.categories c on c.id = a.category_id;

drop view if exists public.media_assets;
create view public.media_assets as
select
  m.id,
  m.url as title,
  m.url as storage_path,
  case when m.type = 'video' then 'video/mp4' else 'image/jpeg' end as mime_type,
  null::bigint as file_size,
  m.uploaded_by,
  now() as created_at
from public.media m;
