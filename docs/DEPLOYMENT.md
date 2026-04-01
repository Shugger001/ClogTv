# Production Deployment Guide

## 1) Environment setup

Create production environment variables from `.env.example`.

Minimum required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional provider flags:

- `AI_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`
- `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- `NEWSLETTER_PROVIDER`, `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`
- `NEWSLETTER_PROVIDER`, `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID`
- `AI_PROVIDER_TIMEOUT_MS`, `NEWSLETTER_PROVIDER_TIMEOUT_MS`

Ads (optional):

- `NEXT_PUBLIC_AD_PROVIDER` and corresponding slot vars

## 2) Supabase setup

Apply migrations in order:

1. `supabase/migrations/0001_initial.sql`
2. `supabase/migrations/0002_core_features.sql`
3. `supabase/migrations/0004_canonical_refactor.sql`
4. `supabase/migrations/0005_articles_rls_hardening.sql`
5. `supabase/migrations/0006_seed_latest_news.sql` (optional content seed)
6. `supabase/migrations/0007_advanced_features.sql`

Deploy edge function:

- `supabase/functions/breaking-publish`

Enable Realtime for:

- `public.articles`

## 3) Build and quality gates

Run before deploy:

```bash
npm run lint
npm run build
```

Optional DB security verification:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/articles_rls_verification.sql
```

## 4) Deployment target (Vercel recommended)

1. Connect repository in Vercel.
2. Set all production env vars in project settings.
3. Trigger deploy.
4. Validate key routes:
   - `/`
   - `/news`
   - `/newsroom`
   - `/live`
   - `/admin`
   - `/bookmarks`

## 5) Post-deploy checks

- Confirm provider logs are present with `request_id`.
- Verify AI fallback still works if provider calls fail.
- Verify newsletter subscription persists in Supabase and syncs to configured provider.
- Confirm PWA registration and offline cache basic behavior.
- Confirm scheduled publish endpoint works for editor/admin roles.
