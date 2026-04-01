-- One-command RLS verification for public.articles
-- Run:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/articles_rls_verification.sql
--
-- Notes:
-- - Uses SET LOCAL ROLE + request.jwt.claims simulation.
-- - Runs in a transaction and rolls back all fixtures.

begin;

-- Shared fixture IDs
-- (kept constant for deterministic output)
do $$
begin
  -- Seed users + articles as setup context.
  insert into public.users(id, name, role)
  values
    ('00000000-0000-0000-0000-0000000000a1', 'RLS Journalist A', 'journalist'),
    ('00000000-0000-0000-0000-0000000000b2', 'RLS Journalist B', 'journalist'),
    ('00000000-0000-0000-0000-0000000000e3', 'RLS Editor', 'editor'),
    ('00000000-0000-0000-0000-0000000000d4', 'RLS Admin', 'admin')
  on conflict (id) do update set role = excluded.role, name = excluded.name;

  insert into public.articles(id, title, slug, content, author_id, status, views, is_breaking)
  values
    ('10000000-0000-0000-0000-0000000000a1', 'RLS Draft A', 'rls-draft-a', 'draft content', '00000000-0000-0000-0000-0000000000a1', 'draft', 0, false),
    ('10000000-0000-0000-0000-0000000000b2', 'RLS Draft B', 'rls-draft-b', 'draft content', '00000000-0000-0000-0000-0000000000b2', 'draft', 0, false),
    ('10000000-0000-0000-0000-0000000000c3', 'RLS Published', 'rls-published-a', 'published content', '00000000-0000-0000-0000-0000000000a1', 'published', 0, false)
  on conflict (id) do update
  set title = excluded.title,
      slug = excluded.slug,
      content = excluded.content,
      author_id = excluded.author_id,
      status = excluded.status;
end
$$;

----------------------------------------------------------------------------
-- T1: Public (anon) can only read published articles
----------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  v_count int;
begin
  select count(*)
    into v_count
  from public.articles
  where id in (
    '10000000-0000-0000-0000-0000000000a1',
    '10000000-0000-0000-0000-0000000000b2',
    '10000000-0000-0000-0000-0000000000c3'
  );

  if v_count <> 1 then
    raise exception 'T1 FAIL: anon expected 1 visible row (published only), got %', v_count;
  end if;
  raise notice 'T1 PASS: anon sees only published article(s)';
end
$$;

----------------------------------------------------------------------------
-- T2: Author can update own draft
----------------------------------------------------------------------------
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}',
  true
);

do $$
begin
  update public.articles
  set content = 'author updated own draft'
  where id = '10000000-0000-0000-0000-0000000000a1';

  if not found then
    raise exception 'T2 FAIL: author could not update own draft';
  end if;
  raise notice 'T2 PASS: author updated own draft';
end
$$;

----------------------------------------------------------------------------
-- T3: Author cannot publish own draft
----------------------------------------------------------------------------
do $$
begin
  begin
    update public.articles
    set status = 'published'
    where id = '10000000-0000-0000-0000-0000000000a1';

    raise exception 'T3 FAIL: author should not be able to publish own draft';
  exception
    when insufficient_privilege then
      raise notice 'T3 PASS: author publish blocked by RLS';
  end;
end
$$;

----------------------------------------------------------------------------
-- T4: Non-author journalist cannot edit another author draft
----------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}',
  true
);

do $$
begin
  begin
    update public.articles
    set content = 'non-author edit attempt'
    where id = '10000000-0000-0000-0000-0000000000a1';

    raise exception 'T4 FAIL: non-author journalist should not edit foreign draft';
  exception
    when insufficient_privilege then
      raise notice 'T4 PASS: non-author journalist edit blocked';
  end;
end
$$;

----------------------------------------------------------------------------
-- T5: Editor can publish
----------------------------------------------------------------------------
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000e3","role":"authenticated"}',
  true
);

do $$
begin
  update public.articles
  set status = 'published', published_at = now()
  where id = '10000000-0000-0000-0000-0000000000b2';

  if not found then
    raise exception 'T5 FAIL: editor could not publish article';
  end if;
  raise notice 'T5 PASS: editor can publish';
end
$$;

----------------------------------------------------------------------------
-- T6: Admin can publish
----------------------------------------------------------------------------
do $$
begin
  update public.articles
  set status = 'draft'
  where id = '10000000-0000-0000-0000-0000000000b2';
end
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000d4","role":"authenticated"}',
  true
);

do $$
begin
  update public.articles
  set status = 'published', published_at = now()
  where id = '10000000-0000-0000-0000-0000000000b2';

  if not found then
    raise exception 'T6 FAIL: admin could not publish article';
  end if;
  raise notice 'T6 PASS: admin can publish';

  raise notice 'All article RLS checks passed.';
end
$$;

rollback;
