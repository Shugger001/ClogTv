-- Harden article RLS to enforce editorial workflow:
-- 1) Authors can only edit their own drafts.
-- 2) Only editors/admins can publish.
-- 3) Public (anon) can only read published articles.

alter table public.articles enable row level security;

drop policy if exists "articles_select_published_or_team" on public.articles;
drop policy if exists "articles_insert_author_or_editor" on public.articles;
drop policy if exists "articles_update_author_or_editor" on public.articles;
drop policy if exists "articles_delete_editor_only" on public.articles;

create policy "articles_select_published_or_team"
on public.articles
for select
using (
  status = 'published'
  or author_id = auth.uid()
  or public.users_is_editor_or_admin()
);

create policy "articles_insert_author_non_published_or_editor"
on public.articles
for insert
with check (
  (author_id = auth.uid() and status in ('draft', 'review', 'scheduled'))
  or public.users_is_editor_or_admin()
);

create policy "articles_update_author_draft_only"
on public.articles
for update
using (
  author_id = auth.uid()
  and status = 'draft'
)
with check (
  author_id = auth.uid()
  and status in ('draft', 'review', 'scheduled')
);

create policy "articles_update_editor_admin"
on public.articles
for update
using (public.users_is_editor_or_admin())
with check (public.users_is_editor_or_admin());

create policy "articles_delete_editor_only"
on public.articles
for delete
using (public.users_is_editor_or_admin());
