create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null default 'journalist' check (role in ('journalist', 'editor', 'admin')),
  avatar_url text
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  content text not null,
  featured_image text,
  author_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published')),
  views bigint not null default 0,
  is_breaking boolean not null default false,
  published_at timestamptz
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid not null references public.articles(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  type text not null check (type in ('image', 'video')),
  uploaded_by uuid not null references public.users(id) on delete cascade
);

create index if not exists idx_articles_status_published_at
  on public.articles(status, published_at desc);
create index if not exists idx_articles_author
  on public.articles(author_id);
create index if not exists idx_articles_category
  on public.articles(category_id);
create index if not exists idx_comments_article
  on public.comments(article_id, created_at desc);

alter table public.users enable row level security;
alter table public.articles enable row level security;
alter table public.categories enable row level security;
alter table public.comments enable row level security;
alter table public.media enable row level security;

create or replace function public.users_is_editor_or_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;

create policy "users_select_own_or_editors"
on public.users
for select
using (id = auth.uid() or public.users_is_editor_or_admin());

create policy "users_update_own_or_admin"
on public.users
for update
using (id = auth.uid() or public.users_is_editor_or_admin())
with check (id = auth.uid() or public.users_is_editor_or_admin());

create policy "categories_select_all"
on public.categories
for select
using (true);

create policy "categories_manage_editors"
on public.categories
for all
using (public.users_is_editor_or_admin())
with check (public.users_is_editor_or_admin());

create policy "articles_select_published_or_team"
on public.articles
for select
using (
  status = 'published'
  or author_id = auth.uid()
  or public.users_is_editor_or_admin()
);

create policy "articles_insert_author_or_editor"
on public.articles
for insert
with check (
  author_id = auth.uid()
  or public.users_is_editor_or_admin()
);

create policy "articles_update_author_or_editor"
on public.articles
for update
using (
  author_id = auth.uid()
  or public.users_is_editor_or_admin()
)
with check (
  author_id = auth.uid()
  or public.users_is_editor_or_admin()
);

create policy "articles_delete_editor_only"
on public.articles
for delete
using (public.users_is_editor_or_admin());

create policy "comments_select_all"
on public.comments
for select
using (true);

create policy "comments_insert_self"
on public.comments
for insert
with check (user_id = auth.uid());

create policy "comments_update_self_or_editor"
on public.comments
for update
using (user_id = auth.uid() or public.users_is_editor_or_admin())
with check (user_id = auth.uid() or public.users_is_editor_or_admin());

create policy "media_select_all"
on public.media
for select
using (true);

create policy "media_insert_self_or_editor"
on public.media
for insert
with check (uploaded_by = auth.uid() or public.users_is_editor_or_admin());

create policy "media_delete_self_or_editor"
on public.media
for delete
using (uploaded_by = auth.uid() or public.users_is_editor_or_admin());
