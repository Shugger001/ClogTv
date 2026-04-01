# Architecture Guide

## Codebase structure

```text
src/
  app/                # Next.js App Router pages + API routes
  components/         # Reusable UI and feature components
  hooks/              # React Query and client-side data hooks
  lib/                # Domain logic, provider adapters, Supabase helpers
  providers/          # App-level React providers
  store/              # Zustand stores
  types/              # Shared TypeScript types
supabase/
  migrations/         # SQL schema and data migrations
  functions/          # Supabase Edge Functions
  tests/              # SQL verification scripts
public/               # Static assets + PWA service worker
docs/                 # Project and deployment documentation
```

## Reusable component strategy

- `components/ui/*` contains low-level reusable primitives (`skeleton`, preferences controls, etc.).
- Feature components stay grouped by domain:
  - `components/news/*`
  - `components/admin/*`
  - `components/editorial/*`
- API integrations live in `lib/*` with clear boundaries:
  - `lib/ai/*`
  - `lib/newsletter/*`
  - `lib/observability/*`
- Route pages in `app/*` compose reusable pieces rather than owning heavy logic.

## Data + backend architecture

- Supabase is the backend for:
  - Auth (`auth.users`)
  - Data (`public.articles`, `public.users`, `public.media`, etc.)
  - Storage (`media` bucket)
  - Realtime subscriptions (`public.articles`)
- RLS enforces security constraints server-side (not client-trusted).
- Scheduled publishing is handled via DB function:
  - `public.publish_scheduled_articles()`

## Runtime architecture

- SSR/ISR in App Router for primary pages.
- React Query for client-side cache + invalidation on interactive surfaces.
- Provider adapters with env flags:
  - AI: `fallback | openai | anthropic`
  - Newsletter: `none | resend | mailchimp`
- Structured logs and correlation IDs for provider observability.
