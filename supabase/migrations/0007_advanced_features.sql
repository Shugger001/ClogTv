-- Advanced features foundation:
-- AI metadata fields, scheduled publishing, newsletter subscribers, bookmarks.

alter table public.articles
  add column if not exists summary text,
  add column if not exists scheduled_for timestamptz;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, article_id)
);

alter table public.newsletter_subscribers enable row level security;
alter table public.bookmarks enable row level security;

drop policy if exists "newsletter_insert_public" on public.newsletter_subscribers;
create policy "newsletter_insert_public"
on public.newsletter_subscribers
for insert
with check (true);

drop policy if exists "newsletter_select_editor_admin" on public.newsletter_subscribers;
create policy "newsletter_select_editor_admin"
on public.newsletter_subscribers
for select
using (public.users_is_editor_or_admin());

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own"
on public.bookmarks
for select
using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own"
on public.bookmarks
for delete
using (auth.uid() = user_id);

create or replace function public.publish_scheduled_articles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count integer;
begin
  update public.articles
  set
    status = 'published',
    published_at = coalesce(published_at, now()),
    updated_at = now()
  where status = 'scheduled'
    and scheduled_for is not null
    and scheduled_for <= now();

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;
