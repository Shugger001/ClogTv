# CLOG TV World Platform

Premium global media platform starter focused on news, live TV, and realtime editorial workflows.

## Final output checklist

- Fully structured codebase: see `docs/ARCHITECTURE.md`
- Clean folder architecture: see `docs/ARCHITECTURE.md`
- Reusable components: feature/ui components under `src/components/*`
- Environment setup instructions: `.env.example` + sections below
- Supabase setup guide: migration and realtime sections below
- Production-ready deployment: see `docs/DEPLOYMENT.md`

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + Framer Motion
- Zustand + React Query
- Supabase Auth + Postgres + Storage + Realtime
- Supabase Edge Functions + RLS policies

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Add your Supabase project values in `.env.local`.

4. Run the app:

```bash
npm run dev
```

## Folder architecture

High-level layout:

- `src/app` - routes and API handlers
- `src/components` - reusable UI + domain components
- `src/hooks` - reusable client hooks
- `src/lib` - shared business logic and provider adapters
- `src/providers` - root providers
- `src/store` - state stores
- `src/types` - shared types
- `supabase/migrations` - DB schema and policy evolution
- `supabase/functions` - edge functions
- `supabase/tests` - SQL validation scripts

Detailed architecture notes: `docs/ARCHITECTURE.md`

## Supabase setup

1. Run migration `supabase/migrations/0001_initial.sql`.
2. Run migration `supabase/migrations/0002_core_features.sql`.
3. Run migration `supabase/migrations/0004_canonical_refactor.sql`.
4. Deploy edge function in `supabase/functions/breaking-publish`.
5. Ensure Realtime is enabled for `public.articles`.
6. Run `supabase/migrations/0005_articles_rls_hardening.sql`.
7. Run `supabase/migrations/0007_advanced_features.sql`.

## Canonical table migration and deprecation

The app now uses canonical tables directly:

- `articles` (content)
- `users` (profile + role)
- `media` (asset metadata)

Legacy tables were renamed and kept for transition:

- `news_articles_legacy`
- `profiles_legacy`
- `media_assets_legacy`

Compatibility views with old names exist so older SQL/integrations can continue to read:

- `news_articles` (view over `articles`)
- `profiles` (view over `users`)
- `media_assets` (view over `media`)

### Deprecation window (recommended)

- Duration: 2-4 weeks after deploying `0004_canonical_refactor.sql`
- Policy during window:
  - All new app code must target canonical tables only
  - Legacy names are read-compatibility only
  - No new writes should depend on legacy names
- Weekly checks:
  - Search code and SQL for `news_articles`, `profiles`, `media_assets`
  - Confirm Edge Functions and dashboards query canonical tables
  - Validate role guards still read from `users`

### Final cutover plan (`*_legacy` removal)

1. **Freeze window**
   - Schedule a short maintenance window for final cleanup.
2. **Confirm zero legacy dependencies**
   - Verify no app code, SQL jobs, BI dashboards, or scripts reference compatibility view names.
3. **Backup**
   - Export schema + data snapshot before destructive changes.
4. **Drop compatibility views**
   - `drop view if exists public.news_articles;`
   - `drop view if exists public.profiles;`
   - `drop view if exists public.media_assets;`
5. **Drop legacy tables**
   - `drop table if exists public.news_articles_legacy;`
   - `drop table if exists public.profiles_legacy;`
   - `drop table if exists public.media_assets_legacy;`
6. **Post-cutover verification**
   - Run smoke tests for `/news`, `/newsroom`, `/live`, `/admin`
   - Publish a test article, upload media, and update one user role
   - Confirm `npm run lint` and `npm run build` are still green

### Rollback note

If cutover issues appear, restore from the pre-cutover backup and re-enable compatibility views before reattempting removal.

## RLS verification script

Validate article RLS (`author draft edit only`, `editor/admin publish only`, `public published-only read`) with:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/articles_rls_verification.sql
```

The script prints `T1..T6 PASS` notices and finishes with `All article RLS checks passed.`.
It runs inside a transaction and ends with `ROLLBACK`, so test fixtures are not persisted.

## Product capabilities included

- Realtime breaking news ticker fed from `articles`
- Multi-author newsroom-ready schema and role model
- Editorial desk UI module for rapid story triage
- Live TV presentation module for global channels
- Auth + role-gated routes: `/newsroom`, `/live`, `/admin`
- News engine with article editor, search/discovery, comments, analytics, notifications
- Ad slots with AdSense/GAM wiring + responsive fallback placeholders

## Role access matrix

- `journalist`: home + newsroom (draft workflow)
- `editor`: newsroom + live (review/publish workflow)
- `admin`: full platform access including `/admin`

## Ads integration

Configure ad delivery with environment variables:

- `NEXT_PUBLIC_AD_PROVIDER=adsense` to use Google AdSense
- `NEXT_PUBLIC_AD_PROVIDER=gam` to use Google Ad Manager
- `NEXT_PUBLIC_AD_PROVIDER=none` to keep placeholders only

Set slot IDs/paths in `.env.local` using `.env.example` as the template.

## AI + newsletter providers

Provider-backed routes support feature flags with safe fallback behavior:

- AI endpoints:
  - `POST /api/ai/headlines`
  - `POST /api/ai/summary`
- Newsletter endpoint:
  - `POST /api/newsletter/subscribe`

### AI provider flags

- `AI_PROVIDER=fallback|openai|anthropic`
- If provider keys are missing or provider calls fail, routes fall back to local deterministic generation.

OpenAI:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `AI_PROVIDER_TIMEOUT_MS` (default `12000`)

Anthropic:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`)

### Newsletter provider flags

- `NEWSLETTER_PROVIDER=none|resend|mailchimp`
- Subscribe requests always persist to `newsletter_subscribers` first.
- Provider sync is best-effort and does not break local persistence flow.

Resend:

- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`
- `NEWSLETTER_PROVIDER_TIMEOUT_MS` (default `10000`)

Mailchimp:

- `MAILCHIMP_API_KEY` (must include datacenter suffix, e.g. `xxxx-us21`)
- `MAILCHIMP_AUDIENCE_ID`

### Observability behavior

Provider calls emit structured JSON logs for production observability:

- `component=provider_call`
- `request_id` (correlation ID propagated from API boundary)
- `provider` (`openai`, `anthropic`, `resend`, `mailchimp`, `none`)
- `operation` (`headline_suggestions`, `article_summary`, `newsletter_sync`)
- `status` (`success`, `fallback`, `error`, `timeout`)
- `duration_ms`, optional `http_status`
- safe error metadata (`error_name`, sanitized/truncated `error_message`)

Sensitive values (API keys, bearer tokens, authorization strings) are never logged.
API routes also return `x-request-id` response headers for traceability across client, API, and provider logs.

## Production deployment

For production-ready rollout steps, see `docs/DEPLOYMENT.md`.

### GitHub

Create an **empty** repository on GitHub (no README/license if you already have commits on `main`). Ensure `.env.local` and other secrets stay untracked; only `.env.example` should be committed.

```bash
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

Use your SSH remote URL instead if you prefer.

Operations docs:

- Deployment guide: `docs/DEPLOYMENT.md`
- On-call runbook: `docs/RUNBOOK.md`
