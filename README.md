# CarryMate

Cross-border peer-to-peer **traveler delivery marketplace**. Senders move personal items along travelers' existing flight routes — cheaper and faster than courier, with trust engineered into every step. **Phase 1 corridor: India → UAE.**

> Trust-first marketplace. See `PLAN.md` (phased build), `ARCHITECTURE.md` (stack + structure), `CarryMate_PRD.md` and `carrymate_technical_prd.html` (product + technical spec).

## Monorepo layout

```
carrymate/
├─ apps/
│  ├─ mobile/     # React Native (bare CLI) — sender + traveler app
│  ├─ backend/    # Node + Express + Prisma + PostgreSQL API
│  └─ admin/      # React + Vite admin dashboard
├─ packages/
│  └─ shared/     # Shared TypeScript types, enums, constants
├─ docker-compose.yml
└─ .env.example
```

## Tech stack

- **Mobile:** React Native (bare CLI), TypeScript, React Navigation, TanStack Query, Zustand
- **Backend:** Node 20+, Express, Prisma, PostgreSQL, Zod, JWT, socket.io
- **Admin:** React 18, Vite, TypeScript, Tailwind + shadcn/ui
- **Infra:** **Supabase** (Postgres), **AWS S3** (storage), **Render** (deploy)
- **Integrations (added per phase):** Razorpay (payments/escrow), Twilio (OTP/SMS), IDFY (KYC), Firebase (push), SendGrid (email)

## Prerequisites

- Node `>= 20`
- A **Supabase** project (Postgres) — or any PostgreSQL (Docker compose provided for local)
- For mobile: JDK 17 + Android SDK (Android), Xcode + CocoaPods (iOS)

## Getting started

```bash
# 1. Install dependencies (root installs all workspaces)
npm install

# 2. Configure environment
cp .env.example .env        # set DATABASE_URL + DIRECT_URL to your Supabase URLs

# 3. Generate Prisma client + run migrations against Supabase
npm run db:generate
npm run db:migrate

#    (Local Postgres alternative: `docker compose up -d postgres`)

# 5. Run services
npm run backend:dev         # API on http://localhost:3000  (GET /health)
npm run admin:dev           # Admin on http://localhost:5173
npm run mobile:start        # Metro bundler, then mobile:android / mobile:ios
```

## Workspace scripts (from repo root)

| Script | Description |
|---|---|
| `npm run typecheck` | Typecheck all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Test all workspaces |
| `npm run backend:dev` | Run API in watch mode |
| `npm run admin:dev` | Run admin dashboard |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project status

**Phase 0 — Foundation & Scaffold** (in progress). See `PLAN.md` for the full phased roadmap.
