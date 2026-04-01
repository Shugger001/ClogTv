create extension if not exists "uuid-ossp";

create type public.article_status as enum ('draft', 'review', 'scheduled', 'published');
create type public.article_priority as enum ('breaking', 'top', 'feature');
create type public.user_role as enum ('reporter', 'editor', 'producer', 'admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'reporter',
  created_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  standfirst text,
  body text,
  category text not null default 'World',
  status public.article_status not null default 'draft',
  priority public.article_priority not null default 'top',
  live_stream_url text,
  author_id uuid not null references auth.users(id) on delete cascade,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_news_articles_status_published_at
  on public.news_articles(status, published_at desc);
create index if not exists idx_news_articles_category
  on public.news_articles(category);
create index if not exists idx_news_articles_author
  on public.news_articles(author_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
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
    'reporter'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_news_articles_updated_at on public.news_articles;
create trigger trg_news_articles_updated_at
before update on public.news_articles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.news_articles enable row level security;

create or replace function public.has_editor_access()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('editor', 'producer', 'admin')
  );
$$;

create policy "profiles_select_own"
on public.profiles
for select
using (id = auth.uid());

create policy "profiles_select_editor_admin"
on public.profiles
for select
using (public.has_editor_access() or id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "articles_select_published_or_team"
on public.news_articles
for select
using (
  status = 'published'
  or auth.uid() = author_id
  or public.has_editor_access()
);

create policy "articles_insert_author_or_editor"
on public.news_articles
for insert
with check (auth.uid() = author_id or public.has_editor_access());

create policy "articles_update_author_or_editor"
on public.news_articles
for update
using (auth.uid() = author_id or public.has_editor_access())
with check (auth.uid() = author_id or public.has_editor_access());

create policy "articles_delete_editor_only"
on public.news_articles
for delete
using (public.has_editor_access());

alter publication supabase_realtime add table public.news_articles;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
