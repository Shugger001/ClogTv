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

## 4) Link and deploy on Vercel

### 4a — Dashboard (recommended)

1. Push this repo to GitHub (or GitLab / Bitbucket) if it is not already remote-hosted.
2. In [Vercel](https://vercel.com): **Add New… → Project → Import** your repository.
3. **Framework preset**: Vercel should detect **Next.js**. Defaults are fine:
   - **Build Command**: `npm run build` (or leave default)
   - **Install Command**: `npm install`
   - **Output**: handled by Next.js (no manual static output)
4. **Environment Variables** (Production, and Preview if you want staging parity): add every name from `.env.example` in the repo root that you use in production. Paste values in the Vercel UI only — never commit real secrets.
   - Required for core app behavior: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Optional: AI, newsletter, ads, and timeout vars as documented in section 1.
   - Use **Production** vs **Preview** tabs if Preview should use a different Supabase project or keys.
5. Click **Deploy**. Note the assigned URL (e.g. `https://your-app.vercel.app`).

### 4b — Supabase Auth URLs (required for login in production)

In Supabase → **Authentication → URL configuration**:

- Set **Site URL** to your Vercel production URL (or your custom domain).
- Add **Redirect URLs** for:
  - `https://<your-project>.vercel.app/**`
  - Your custom domain patterns if you add one later.

Without this, OAuth/email redirects may still point at localhost.

### 4c — CLI (optional)

If you prefer linking from the terminal:

```bash
npx vercel login
npx vercel link
```

This creates a local `.vercel` directory (already listed in `.gitignore`). Configure env vars in the dashboard or with `vercel env add`; do not commit `.env.local` or `.vercel` project files with secrets.

### 4d — Smoke test after deploy

Validate key routes:

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
