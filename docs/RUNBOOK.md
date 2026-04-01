# On-Call Runbook

## Scope

This runbook covers production operations for:

- web availability and routing
- Supabase data/auth issues
- provider integrations (AI + newsletter)
- rollback procedures

---

## Incident severity

- **SEV-1 (Critical)**: site down, auth broken globally, database outage, data corruption risk.
- **SEV-2 (High)**: major user-facing feature broken (news publish flow, broken feeds, provider failures with no fallback).
- **SEV-3 (Medium)**: degraded functionality (timeouts, partial page errors, single integration failing with fallback active).
- **SEV-4 (Low)**: cosmetic/documentation issues, non-blocking warnings.

---

## Fast triage checklist (first 10 minutes)

1. Confirm blast radius:
   - all users vs one region/role
   - all routes vs specific routes (`/news`, `/newsroom`, `/admin`)
2. Check latest deployment timestamp and config changes.
3. Check application logs for `request_id` and `component=provider_call`.
4. Validate platform health quickly:
   - homepage load
   - login flow
   - article read and newsroom save
5. If provider-related, confirm fallback behavior is active.

---

## Core health checks

## App checks

- `npm run lint`
- `npm run build`
- Open critical routes:
  - `/`
  - `/news`
  - `/newsroom`
  - `/live`
  - `/admin`
  - `/bookmarks`

## Database checks

- Run RLS verification script:

```bash
psql "$SUPABASE_DB_URL" -f supabase/tests/articles_rls_verification.sql
```

- Confirm scheduled publishing function:

```sql
select public.publish_scheduled_articles();
```

## Realtime check

- Ensure realtime still enabled on `public.articles`.

---

## Correlation and log tracing

API responses include `x-request-id`.

Use this ID to trace a single failing action across logs:

- client request
- API route logs
- provider logs (`component=provider_call`, `request_id=<id>`)

Important structured log fields:

- `provider`
- `operation`
- `status`
- `duration_ms`
- `http_status`
- `error_name`

---

## Provider outage fallback actions

## AI provider outage (OpenAI/Anthropic)

Symptoms:

- `/api/ai/headlines` or `/api/ai/summary` latency spikes or provider errors.

Immediate actions:

1. Set `AI_PROVIDER=fallback`.
2. Redeploy (or restart with updated env).
3. Verify AI buttons still return deterministic local output.
4. Monitor log status transition from `error/timeout` to `fallback`.

Recovery actions:

- When provider is stable, restore `AI_PROVIDER=openai|anthropic`.
- Keep timeout flags conservative:
  - `AI_PROVIDER_TIMEOUT_MS=12000` (or lower if required).

## Newsletter provider outage (Resend/Mailchimp)

Symptoms:

- provider sync errors, but local subscribe API still returns success.

Immediate actions:

1. Set `NEWSLETTER_PROVIDER=none`.
2. Redeploy/restart with env change.
3. Continue capturing subscriptions in `newsletter_subscribers`.
4. Export/replay to provider once healthy.

Recovery actions:

- Restore provider flag:
  - `NEWSLETTER_PROVIDER=resend|mailchimp`
- Reconcile subscribers from `newsletter_subscribers` for outage window.

---

## Rollback sequence

Use this when a release causes significant regression.

1. **Stabilize**
   - freeze deploys/merges
   - announce incident and owner
2. **Rollback app**
   - redeploy previous known-good build
3. **Rollback config**
   - revert risky env changes (provider flags/timeouts)
4. **Rollback database only if required**
   - prefer forward fixes
   - if needed, restore from backup snapshot
5. **Validate**
   - critical route smoke tests
   - auth + newsroom + publish + bookmarks + subscription path
6. **Closeout**
   - incident timeline
   - root cause
   - preventive actions

---

## Canonical DB rollback caution

Current architecture uses canonical tables:

- `articles`, `users`, `media`

Compatibility views:

- `news_articles`, `profiles`, `media_assets`

If rollback touches schema:

- preserve compatibility views to avoid breaking legacy references during recovery.

---

## Post-incident template

- **Incident ID**:
- **Severity**:
- **Start / End time**:
- **User impact**:
- **Root cause**:
- **Detection gap**:
- **Mitigation steps**:
- **Permanent fix**:
- **Owner + due date**:

---

## Ownership

- Primary on-call: platform engineer
- Secondary: backend/data engineer
- Escalation: product + infrastructure owners
