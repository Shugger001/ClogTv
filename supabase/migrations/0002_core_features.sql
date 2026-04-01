alter type public.user_role add value if not exists 'journalist';

alter table public.news_articles
  add column if not exists content text,
  add column if not exists featured_image text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_breaking boolean not null default false,
  add column if not exists views bigint not null default 0,
  add column if not exists read_time integer not null default 1,
  add column if not exists video_url text,
  add column if not exists video_provider text,
  add column if not exists breaking_updated_at timestamptz;

update public.news_articles
set content = coalesce(content, body)
where content is null;

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (name, slug)
values
  ('News', 'news'),
  ('Politics', 'politics'),
  ('Entertainment', 'entertainment'),
  ('Sports', 'sports'),
  ('Business', 'business'),
  ('Technology', 'technology')
on conflict (slug) do nothing;

create table if not exists public.article_views (
  id bigint generated always as identity primary key,
  article_id uuid not null references public.news_articles(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  session_id text,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_article_views_article_time
  on public.article_views(article_id, viewed_at desc);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.news_articles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  storage_path text not null,
  mime_type text not null,
  file_size bigint,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.has_editor_access()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'journalist'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table public.categories enable row level security;
alter table public.article_views enable row level security;
alter table public.comments enable row level security;
alter table public.comment_votes enable row level security;
alter table public.notifications enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "articles_select_published_or_team" on public.news_articles;
create policy "articles_select_published_or_team"
on public.news_articles
for select
using (
  status = 'published'
  or auth.uid() = author_id
  or public.has_editor_access()
);

drop policy if exists "articles_insert_author_or_editor" on public.news_articles;
create policy "articles_insert_author_or_editor"
on public.news_articles
for insert
with check (auth.uid() = author_id or public.has_editor_access());

drop policy if exists "articles_update_author_or_editor" on public.news_articles;
create policy "articles_update_author_or_editor"
on public.news_articles
for update
using (auth.uid() = author_id or public.has_editor_access())
with check (auth.uid() = author_id or public.has_editor_access());

drop policy if exists "articles_delete_editor_only" on public.news_articles;
create policy "articles_delete_editor_only"
on public.news_articles
for delete
using (public.has_editor_access());

create policy "categories_select_all"
on public.categories
for select
using (true);

create policy "categories_editor_manage"
on public.categories
for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "comments_select_visible"
on public.comments
for select
using (is_hidden = false or public.has_editor_access() or auth.uid() = user_id);

create policy "comments_insert_auth"
on public.comments
for insert
with check (auth.uid() = user_id);

create policy "comments_update_owner_or_editor"
on public.comments
for update
using (auth.uid() = user_id or public.has_editor_access())
with check (auth.uid() = user_id or public.has_editor_access());

create policy "comment_votes_select_all"
on public.comment_votes
for select
using (true);

create policy "comment_votes_insert_auth"
on public.comment_votes
for insert
with check (auth.uid() = user_id);

create policy "comment_votes_update_auth"
on public.comment_votes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "article_views_editor_select"
on public.article_views
for select
using (public.has_editor_access());

create policy "article_views_insert_any"
on public.article_views
for insert
with check (true);

create policy "notifications_select_own"
on public.notifications
for select
using (auth.uid() = user_id);

create policy "notifications_update_own"
on public.notifications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notifications_editor_insert"
on public.notifications
for insert
with check (public.has_editor_access());

create policy "media_select_all"
on public.media_assets
for select
using (public.has_editor_access() or auth.uid() = uploaded_by);

create policy "media_insert_auth"
on public.media_assets
for insert
with check (auth.uid() = uploaded_by);

create policy "media_delete_owner_or_editor"
on public.media_assets
for delete
using (auth.uid() = uploaded_by or public.has_editor_access());

create or replace function public.increment_article_views(article_slug text, viewer uuid, session text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id from public.news_articles where slug = article_slug limit 1;
  if target_id is null then
    return;
  end if;

  insert into public.article_views(article_id, viewer_id, session_id)
  values (target_id, viewer, session);

  update public.news_articles
  set views = views + 1
  where id = target_id;
end;
$$;
