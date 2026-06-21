# CarryMate — Phased Build Plan (Backend + Admin + Apps)

> Strategy: build CarryMate **fresh/greenfield** using the **same tech stack as Datingo** (Datingo is a stack reference only — **no code is copied**), in **production-safe vertical slices**. Each phase is independently shippable; nothing in a later phase breaks an earlier phase. No real money / public launch until Phase 7. Build **one phase at a time, no breakage.**
> Companion docs: `ARCHITECTURE.md` (stack + module map), `carrymate_technical_prd.html` (field-level schema + API), `CarryMate_PRD.md` (product).

---

## Cross-cutting rules (prevent phase/production conflicts)

These apply to **every** phase:

- **Trunk always green:** `main` is always deployable. Work on feature branches → PR → merge only when staging-tested.
- **Three environments:** `dev` (local docker-compose) → `staging` (render) → `prod`. Separate DBs, secrets, API keys per env. App points at staging until Phase 7.
- **Feature flags for everything incomplete:** `ENABLE_REAL_PAYMENTS`, `ENABLE_AUTO_KYC`, `ENABLE_CHAT`, `ENABLE_CANADA`, `ENABLE_USA`, etc. New work ships behind a flag = off in prod until ready.
- **Additive, forward-only DB migrations:** never drop/rename a live column in the same release that stops using it (expand → migrate → contract over two releases). All migrations reversible in dev.
- **API is versioned + additive (`/v1`):** never change an existing endpoint's contract; add new fields/endpoints instead. Breaking change = `/v2`.
- **Stub-then-real for risky integrations:** payments and flight verification ship as stubs first so the full flow works end-to-end before real money / external dependencies / legal sign-off.
- **Seed data every phase:** `prisma/seed.ts` kept current so admin + apps are testable at all times.
- **Definition of Done per feature:** code + zod validation + error handling + tests + seed + admin visibility (if relevant) + flag wired. No half-merged features on main.
- **Security baseline from day one:** TLS, helmet, rate limits, private S3, hashed/masked PII, audit logs on admin actions, no secrets in code.

---

## Phase 0 — Foundation & Scaffold (no features)
**Goal:** a fresh, building skeleton with CI/CD and environments. Nothing user-facing yet. **No code copied from Datingo — only the same stack/structure.**

- Scaffold a fresh monorepo (`@carrymate/*` workspaces): `apps/mobile` (bare RN CLI), `apps/backend` (Express+Prisma), `apps/admin` (React+Vite), `packages/shared`.
- Set app id/bundle, names, icons placeholder; base tooling (TS, eslint, prettier).
- Confirm `apps/backend` runs locally (docker-compose: Postgres + backend), `apps/mobile` builds Android, `apps/admin` runs.
- Replace Prisma schema with CarryMate models (users, kyc_documents, travel_routes, delivery_requests, bids, transactions, conversations, messages, ratings, disputes, notifications) + initial migration + seed.
- Set up env files (`.env.example`) for all integrations (Razorpay, IDFY, MSG91, FCM, SendGrid, S3) — keys can be placeholders.
- CI: lint + typecheck + test on PR. CD: auto-deploy `main` → staging (render).
- Health endpoint, logging (Winston/Morgan), error handler, base `/v1` router.
- **Exit criteria:** backend deploys to staging green; app builds and hits a `/health`; schema migrated; CI/CD live.

---

## Phase 1 — Identity & Trust Core (auth + KYC)
**Goal:** users can sign up, pick role(s), and complete KYC. This gates everything else.

**Backend**
- Phone OTP auth via **MSG91** (swap from Datingo's Twilio); JWT access(15m)+refresh(7d) rotation; rate limits (3 OTP/10min, lock after 5 fails).
- User model with dual role (sender/traveler/both), status (active/suspended/banned).
- **KYC via IDFY** (behind `ENABLE_AUTO_KYC`): Aadhaar OTP (sender), Passport OCR + Face Match (traveler); async webhook handling; `MANUAL_REVIEW` fallback.
- `requireKYC` middleware gate (enforced server-side, not UI).

**Admin**
- KYC review queue: view docs (signed S3 URLs), IDFY confidence, approve/reject with reason, audit log.
- User management: search, profile, suspend/ban/reactivate.

**App**
- Reuse Datingo auth/onboarding screens; phone+OTP; role selection; KYC flows (Aadhaar / passport+selfie); "verification in progress" state.

- **Exit criteria:** a real user can sign up → verify KYC → reach a (empty) home, gated correctly; admin can review KYC.

---

## Phase 2 — Marketplace Core (listings + matching)
**Goal:** trips and requests exist, get matched, bids placed and accepted (no money yet).

**Backend**
- `routes/` (traveler trips): origin/dest airports (whitelist), dates, capacity; ticket/flight verification (ticket OCR + schedule existence check — see ARCHITECTURE §5, not AviationStack PNR).
- `requests/` (delivery requests): item category, weight/value caps, photos (S3), recipient, deadline; **prohibited-item screening** (keyword scan + DB constraint, block at creation).
- Matching: eligibility query (route + date + capacity + KYC + corridor) → push fan-out to eligible travelers.
- `bids/`: create (fee range, active-bid cap), accept → atomically reject other bids → create `order/transaction` in `PENDING_PAYMENT`.
- Business-rule enforcement (caps, corridor, deadlines) in service + DB.

**Admin**
- Request monitor: list/filter, view photos, force-expire, override prohibited check.

**App**
- Sender: create-request wizard, bid list, select traveler.
- Traveler: add route, browse available packages (route-filtered), submit bid.

- **Exit criteria:** sender posts request → traveler bids → sender accepts → order created (awaiting payment). Prohibited items blocked.

---

## Phase 3 — Payments & Escrow
**Goal:** money flows safely; held until delivery. Ships stub-first, then real behind a flag.

**Backend**
- Payment abstraction interface; **stub mode** = mark `ESCROW_HELD`/`RELEASED` manually so the whole flow works without real money.
- **Razorpay** integration behind `ENABLE_REAL_PAYMENTS`: order creation on bid accept; checkout; **webhook** (signature verify + idempotency) → `ESCROW_HELD`; unlock traveler contact.
- **Razorpay Route** payout to traveler on delivery confirm; 15% commission; penny-drop bank verification before payout eligibility.
- Refund engine (full/partial) for cancellations + dispute outcomes.

**Admin**
- Transaction view; manual refund trigger; payout status; escrow state visibility.

**App**
- Checkout/escrow screen (price breakdown, "funds held" explainer); payment via Razorpay SDK; bank-account setup for travelers.

- **Exit criteria:** in stub mode, full post-accept flow works; in real mode (staging keys), payment → escrow held → payout on confirm, idempotent webhooks. Legal review of Route/escrow kicked off (not blocking code).

---

## Phase 4 — Fulfillment & Trust Loop
**Goal:** the actual handover, delivery, and resolution — the trust mechanics that are the product.

**Backend**
- Order state machine: Created → Matched → Handover → In Transit → Arrived → Delivered → Confirmed → Closed.
- **Open-box declaration** (checklist + 2+ photos + GPS/timestamp, stored as audit JSON) required before In Transit.
- Handover OTP (pickup) + delivery OTP + delivery-proof photos.
- Scheduled worker (node-cron) for **48h auto-confirm** + 7-day request expiry (Datingo has no BullMQ).
- `disputes/` (adapt Datingo `reports/`): open within SLA → escrow freeze → evidence → admin decision (refund/release/split) → outcome logged.
- `ratings/`: bidirectional after completion; update rating_avg/count; repeat-traveler / verified-sender badges.

**Admin**
- Dispute resolution: timeline, evidence viewer, chat transcript, resolve + mandatory note.

**App**
- Tracking timeline; open-box flow (traveler); delivery-proof upload; confirm-delivery (sender); raise-dispute; rating prompt.

- **Exit criteria:** complete a full delivery lifecycle incl. open-box, proof, auto-confirm, a dispute, and ratings.

---

## Phase 5 — Communications
**Goal:** on-platform chat + the full notification system. Can overlap Phase 4.

**Backend**
- Chat (reuse Datingo socket.io chat): conversations tied to orders; **PII filter** (strip phone/email/UPI/links); chat **unlocked only after escrow held**; retain logs for disputes.
- Notification service: event matrix across push (FCM) / SMS (MSG91) / email (SendGrid) / in-app; user prefs/opt-out.
- Proactive "transit reassurance" nudges to senders (PRD emotional-low fix).

**App**
- Chat screen (reuse + adapt); notification center; deep-links from push to order/chat.

- **Exit criteria:** matched parties chat (post-escrow) with PII filtered; key events fire correct notifications.

---

## Phase 6 — Safety, Fraud & Admin Hardening
**Goal:** abuse resistance and ops visibility before exposing to the public.

**Backend**
- Rule-based **fraud scoring** (0–100): ≥50 flag, ≥70 auto-hold escrow; factors per TRD (new user, low rating, dispute history, high value, burst, multi-device, duplicate KYC hash, shared IP w/ banned).
- Auto-flag rules (duplicate Aadhaar/passport hash, self-bidding, dispute-rate suspend, OTP lockout).
- Anti-disintermediation signals; velocity limits; full audit trail.

**Admin**
- Dashboard KPIs (SVD/mo, GMV, match rate, dispute/fraud rate, KYC backlog); risk/fraud queue with hold/release/refund/ban; corridor health (time-to-match, fill rate).

- **Exit criteria:** fraud signals flag/hold correctly; admin can run daily ops from the dashboard.

---

## Phase 7 — Hardening, Compliance, QA & Launch
**Goal:** production-ready, legally cleared, and live to a closed pilot.

- **Security review:** pen-test pass, secrets audit, RLS/authz audit, S3 private + signed URLs, helmet/CSP/HSTS.
- **Compliance (blocks go-live):** RBI payment-aggregator stance + use licensed escrow product; FEMA cross-border payout review; **DPDP** (consent, deletion/export, KYC retention/purge); ToS framing (not a courier; traveler customs responsibility).
- **Perf/load:** p95 latency targets, DB indexes, 1k concurrent users; observability (CloudWatch/alerts, error tracking).
- **Flip flags on prod:** real payments, auto-KYC, chat — switch app from staging → prod API.
- **Store submission:** Play/App Store (frame as "personal errand marketplace"); internal → closed track.
- **Closed pilot:** single route **Delhi → Dubai**, seeded travelers first, ~50 trips; watch guardrails (dispute/fraud/seizure) — any spike pauses growth.

- **Exit criteria:** MVP launch gate met — delivery success >90%, match rate >60%, dispute <5%, first GMV; trust incidents handled <4h SLA.

---

## Phase 8 — Post-MVP Scale (roadmap, not MVP)
- India → **Canada** corridor (CBSA/CFIA rules) behind flag.
- Insurance API (real claims), recipient signature, traveler ranking, corporate gifting.
- India → **USA** once trust infra mature (FDA/TSA/CBP).
- ML fraud detection augmenting rules.

---

## Dependency / sequencing notes
- Hard order: **0 → 1 → 2 → 3 → 4**. Phase 1 (identity/KYC) gates all transactions; Phase 3 needs Phase 2 orders; Phase 4 needs Phase 3.
- **Can overlap:** Phase 5 (chat/notifications) can start during Phase 4; Phase 6 admin/fraud can build incrementally from Phase 1 onward.
- **Stub seams** (payments, flight verify) keep later phases from blocking earlier shippable states.
- Rough solo-founder horizon: foundations + identity (P0–P1) first; marketplace + money + fulfillment (P2–P4) is the bulk; comms/fraud/launch (P5–P7) hardens it. Calendar estimate after we scope P0–P1 concretely.
