# CarryMate — Delhi → Dubai Closed Pilot: Operations Plan

> Operational playbook for the first closed pilot (single corridor, seeded supply). Pairs with [PLAN.md](../../PLAN.md) Phase 7 and the [Terms](../legal/TERMS_OF_SERVICE.md)/[Privacy](../legal/PRIVACY_POLICY.md) drafts.

---

## 1. Objective & scope
Prove the trust-and-delivery loop on **one corridor — Delhi (DEL) → Dubai (DXB)** with a **closed, invite-only cohort**, before any open launch. Validate that verified travellers + escrow + open-box + disputes actually produce safe, on-time deliveries.

**In scope:** DEL→DXB only · INR only · invited senders & travellers · supply seeded first.
**Out of scope:** other corridors, open sign-up, real marketing, insurance claims.

## 2. Success metrics (launch gate — from PLAN.md)
| Metric | Target |
|---|---|
| Delivery success rate | **> 90%** |
| Match rate (requests that get a bid/accept) | **> 60%** |
| Dispute rate | **< 5%** |
| Trust-incident response | **< 4h** SLA |
| First GMV | Any real, clean transactions |
Track these weekly in the Admin dashboard.

## 3. Supply-first seeding (done)
The corridor is pre-seeded with **50 KYC-verified, mostly flight-confirmed traveller trips + 12 open sender requests** (`npm run pilot:seed -w @carrymate/backend`; namespaced `+9170…`/`+9171…`, removable). This avoids the empty-marketplace cold start. **Replace seed accounts with real invited travellers as they onboard**, and remove seed rows before any public launch (cleanup query in the seed log).

## 4. Cohort onboarding
1. **Recruit travellers first** (frequent DEL↔DXB flyers; aim for a steady weekly supply). Then invite senders.
2. Each participant: install app → phone OTP → **complete Didit KYC** → travellers add a trip (auto flight-verify via AviationStack, else admin verifies the ticket) → senders post a request.
3. Brief every participant on: open-box requirement, prohibited items, that **the traveller is responsible for customs**, and on-platform-only communication/payment.

## 5. Daily operations checklist (Admin)
Run through the Admin dashboard each day:
- [ ] **KYC review queue** — clear pending/in-review verifications.
- [ ] **Flight verification queue** — verify trips AviationStack couldn't auto-confirm (view the ticket).
- [ ] **Disputes** — triage any open dispute within SLA; gather evidence; decide.
- [ ] **Fraud/risk queue** — review flagged/held orders (score ≥50 flagged, ≥70 auto-held); clear or escalate.
- [ ] **Failed payouts** — retry/resolve.
- [ ] **Metrics** — check match rate, delivery rate, dispute/fraud rate, KYC backlog vs targets.

## 6. Guardrails & pause triggers
Watch these continuously; **pause new matches** if any trips:
- **Customs seizure / prohibited item** reaches transit → freeze, investigate, review screening rules.
- **Dispute rate > 5%** in a rolling week → pause, root-cause.
- **Fraud signals spike** (duplicate KYC, burst orders, multi-account) → tighten, investigate.
- **Safety/trust incident** (any harm, threat, or off-platform coercion) → immediate hold + §7.

## 7. Incident response (SLA < 4h for trust incidents)
| Incident | First action | Owner | Target |
|---|---|---|---|
| Customs/seizure | Freeze related order(s) + escrow; contact both parties; document | Ops | < 4h |
| Dispute | Freeze escrow (auto), request evidence, decide | Ops | < 24h to first response |
| Fraud hold | Review score/factors, clear or ban | Ops | < 24h |
| Safety/abuse | Suspend account(s), preserve chat logs, escalate | Founder | < 4h |
| Payment/payout failure | Reconcile, retry, communicate | Ops | < 24h |
Keep a simple incident log (date, type, parties, action, outcome) for review.

## 8. Communications
- **Email (live):** transactional emails for key events (bid accepted, payment, in-transit, delivered, payout, disputes, KYC) via Brevo. ⚠️ Move off the gmail sender to a **domain sender with SPF/DKIM** before relying on it for deliverability.
- **Push (live):** FCM for all major events.
- **SMS:** not yet wired (paid) — OTP backup/delivery alerts to add later.
- **Manual touch:** during the pilot, personally check in with each participant after their first delivery.

## 9. Money & compliance posture (pilot)
- **No real-money payout rail is live yet** (no payment gateway account; Gap C unbuilt). Until a licensed payment/escrow partner is integrated, run the pilot in **stub/escrow-simulation mode** or with a **manual, documented settlement** — do **not** improvise unlicensed money movement.
- Keep the **traveller-is-importer** framing front-and-centre; CarryMate stays out of customs business.
- Have the [Terms](../legal/TERMS_OF_SERVICE.md) + [Privacy](../legal/PRIVACY_POLICY.md) finalised by counsel **before** onboarding real users.

## 10. Exit criteria → scale
Move beyond the closed pilot only when, over a sustained window, you hit: delivery > 90%, match > 60%, dispute < 5%, zero unresolved trust/seizure incidents, and a **licensed money rail** in place. Then consider widening the cohort or adding a second UAE city — **not** a new country (see [Phase 8 playbook](../../PHASE8_CANADA_US_EXPANSION.md)).

---
*Grounded in the live Admin tooling (KYC/flight/dispute/fraud/payout queues + metrics), the pilot seed, and the escrow/open-box/dispute mechanics already built. The only true blocker to a real-money pilot is the licensed payment rail (Gap C).*
