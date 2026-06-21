# CarryMate — Technical Architecture (MVP)

> Cross-border P2P traveler delivery marketplace. Phase 1: **India → UAE**, documents + sealed/packaged goods.
> Guiding principle: **trust-first** — prove a sender will trust a stranger and a traveler will bother.
>
> **Build strategy (decided):** build **fresh/greenfield** using the **same tech stack as Datingo** (`d:\My Projects\Datingo`). Datingo is a **stack reference only — no code is copied.** `carrymate_technical_prd.html` remains the field-level reference for schema + API contracts.

---

## 1. Stack (same as Datingo, = TRD)

- **Monorepo (npm workspaces, Node ≥ 22.11):** `apps/mobile`, `apps/backend`, `apps/admin`, `packages/shared`.
- **Mobile:** bare **React Native 0.85 (CLI, not Expo)**, React 19, React Navigation v6, TanStack Query, Zustand, axios, react-native-firebase (push), socket.io-client, react-native-image-picker, vector-icons.
- **Backend:** Node + **Express 4** + **Prisma 6** + **PostgreSQL**, JWT/bcrypt, socket.io, multer, zod, helmet, express-rate-limit, swagger. Layered modules (routes → controllers → services → repositories).
- **Admin:** existing Datingo admin web app, extended.
- **Deploy:** docker-compose (local) + render.yaml (Datingo already configured).

**Swap for India-first:** Stripe → **Razorpay** (Route for escrow/payout, webhooks, penny-drop); Twilio → **MSG91** (OTP/SMS/WhatsApp).
**Keep:** firebase-admin (push), AWS S3 (KYC docs + package photos), socket.io (chat).
**Add new:** **IDFY** KYC, ticket/flight verification.

---

## 2. Module structure (built fresh; Datingo's layout as inspiration only — no code copied)

**Backend modules to build** (`apps/backend/src/modules/`): `auth/` (phone OTP + JWT, MSG91), `kyc/` (IDFY), `users/` (profile + roles + ratings status), `routes/` (traveler trips + ticket/flight verify), `requests/` (delivery requests + prohibited screening), `bids/`, `orders/` (matching → transaction on bid accept), `payments/` (Razorpay escrow/payout), `chat/` (socket + PII filter, unlock after escrow), `disputes/`, `ratings/`, `notifications/` (FCM/MSG91/SendGrid), `media/` (S3 uploads), `admin/` (KYC review, dispute resolution, risk/fraud, KPIs).

**Mobile screens to build** (`apps/mobile/src/screens/`): `auth/`, `onboarding/`, `kyc/`, `profile/`, `settings/`, `chat/`, `sender/` (create request, bid list, checkout, tracking), `traveler/` (routes, available packages, delivery proof), shared (notification center, ratings).

**Mobile shared infra to set up:** `api/`, `store/` (Zustand), `navigation/`, `services/` (socket/api client), `hooks/`, `theme/`, `components/` — same structure conventions as Datingo, written fresh.

> Datingo's own module/screen names (for layout reference only): backend = auth, chat, discovery, matches, media, notifications, profiles, reports, settings, subscriptions, swipes, admin; mobile = auth, chat, discovery, main, matches, onboarding, profile, settings, subscription.

---

## 3. Business Rules (enforce at DB + service layer, never UI-only)

From TRD: commission **15%** default (generated column on bids); carry fee **₹200–3,000**; max weight **5 kg**; max declared value **₹10,000**; max **3** active requests/sender, **5** active bids/traveler; escrow **held until delivery confirmed**; **48h auto-confirm** + **48h dispute window**; origin India airports whitelist (DEL/BOM/BLR/HYD/MAA/CCU/COK/AMD), destination **UAE only** (DXB/AUH/SHJ), Canada/USA behind feature flags. **Prohibited (block at request creation):** electronics, medicines, liquids, >₹10k value, commercial, currency/bullion. KYC `VERIFIED` gate before any sender funds or traveler bids. Open-box declaration mandatory before status → in-transit.

---

## 4. Data Model (Postgres / Prisma)

Replace Datingo's dating models with CarryMate models (field-level detail in `carrymate_technical_prd.html` §3): `users`, `kyc_documents`, `travel_routes`, `delivery_requests`, `bids`, `transactions`, `conversations`, `messages`, `ratings`, `disputes`, `notifications`. Reuse Datingo's `User`/`Conversation`/`Message`/`Media`/admin patterns as a starting point. Money in integer INR. Recipient PII + KYC docs never exposed to counterparty; traveler phone revealed only after `payment.captured`.

Background jobs (Datingo has no BullMQ): use **node-cron / a scheduled worker** in the backend for the 48h auto-confirm and 7-day request expiry (or add BullMQ if queueing grows).

---

## 5. Known redesigns vs TRD (resolve at the relevant milestone)

1. **Flight verification:** AviationStack does NOT do PNR lookup. MVP: ticket-image OCR (IDFY/manual) + confirm flight/route/date exists via a schedule API → treat as "ticket verified," not "PNR verified." Manual admin spot-check backstop.
2. **Razorpay Route ≠ true escrow** (split settlement). Validate hold/on-hold-transfer before relying on it. Abstract payments behind an interface; **stub `held/released` first** so feature work isn't blocked.
3. **Custody/legal:** never hold funds ourselves; use the provider's hold product. Validate RBI payment-aggregator + FEMA before real money (blocks go-live, not coding).

---

## 6. Build Order (fresh build)

1. **M0 — Scaffold:** create fresh monorepo (`@carrymate/*`): RN CLI mobile + Express/Prisma backend + Vite admin + shared; get app building + backend running locally (docker-compose).
2. **M1 — Data model:** replace Prisma schema with CarryMate models + migrations + seed.
3. **M2 — Auth:** reuse; swap Twilio→MSG91; dual sender/traveler role.
4. **M3 — KYC (IDFY):** Aadhaar OTP (sender) + Passport OCR/Face Match (traveler); status machine; hard gate; admin fallback.
5. **M4 — Listings:** `routes/` + `requests/` + prohibited screening + browse/filter.
6. **M5 — Matching + bids:** eligibility query → push fan-out → bid/accept → atomic reject-others → order.
7. **M6 — Payments (stub → Razorpay):** totals + 15% commission + `held/released`; Razorpay Route + webhooks; penny-drop payout.
8. **M7 — Handover:** open-box declaration + photo proof + delivery OTP + status machine; 48h auto-confirm job.
9. **M8 — Disputes + refunds.**
10. **M9 — Ratings + badges.**
11. **M10 — Chat adaptation** (reuse + PII filter + escrow-unlock) **+ notifications** (FCM/MSG91/SendGrid).
12. **M11 — Admin extensions** (KYC/dispute/risk). **M12 — Tests** (critical-path per TRD §13).

Validate with a closed group on one route (Delhi → Dubai) before opening up.

---

## 7. Open Decisions / To Research
- [ ] Razorpay Route hold/escrow semantics + payout (blocks M6 real money, not stub).
- [ ] RBI payment-aggregator / FEMA cross-border legal review (blocks go-live).
- [ ] Flight verification approach (ticket OCR + schedule check) — finalize at M4/M5.
- [ ] IDFY contract + pricing; Aadhaar consent/DPDP compliance.
- [ ] Final India→UAE allowed-items whitelist (legal review).
```
