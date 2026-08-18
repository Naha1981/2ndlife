# L1 Production Setup Runbook

## 1. Neon Production Database
- Create project `2ndlife-prod` at console.neon.tech.
- Copy the POOLED connection string (?pgbouncer=true) → DATABASE_URL.
- Copy the DIRECT (session) string → DIRECT_URL.

## 2. Push schema to Neon
- Set DATABASE_URL + DIRECT_URL locally.
- Run: npx prisma db push
- Verify tables: wa_accounts, OutboxMessage, PlatformJob, contact, message.

## 3. Deploy Core App to Vercel
- Import Naha1981/2ndlife at vercel.com/new.
- Add ALL env vars from .env.example (real values).
- Deploy. Confirm green at the Deployments tab.

## 4. Verify
- GET https://<app>.vercel.app/api/v1/selftest → expect status "ok".
- If "degraded", the `failed` array tells you exactly which secret is missing.

## 5. Cron
- Vercel crons are wired in vercel.json (auto-sends Bearer CRON_SECRET).
- Hobby-plan fallback: use cron-job.org to POST /api/cron/dispatch-outbox
  and /api/cron/process-jobs every minute with header
  Authorization: Bearer <CRON_SECRET>.
