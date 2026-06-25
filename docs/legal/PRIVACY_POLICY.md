# CarryMate — Privacy Policy

> **DRAFT for legal review.** Aligned to India's **Digital Personal Data Protection Act, 2023 (DPDP)** and reflects the data flows actually implemented in the product. Not legal advice; counsel must finalise before publication. Placeholders in **[brackets]** need input.

**Last updated:** [DATE] · **Version:** 2026-06-24

CarryMate, operated by **[Legal Entity Name, address]** ("we", "us"), respects your privacy. This policy explains what personal data we collect, why, who we share it with, and the rights you have. By using CarryMate you consent to this processing.

---

## 1. Data we collect
| Category | Examples | Why |
|---|---|---|
| **Account & contact** | Phone number, email, full name, role (sender/traveller), language | Create your account, sign-in, notifications |
| **Identity (KYC)** | Government ID (Aadhaar/PAN/passport), ID number, selfie/liveness, verification result | Mandatory identity verification before transacting (trust & safety, legal) |
| **Transaction** | Requests, trips, bids, orders, fees, payout/bank details, escrow status | Operate the marketplace and payments |
| **Item & delivery** | Item descriptions, photos, recipient name/phone/address, open-box declarations, delivery proof | Facilitate and verify carriage |
| **Communications** | In-app chat messages (with contact details auto-masked), notifications | Coordinate handovers; preserve dispute records |
| **Device & usage** | Device push token (FCM), app interactions, IP address, request/correlation IDs | Push notifications, security, debugging, error tracking |
| **Location** | Coarse location (if granted) | Relevant trip/route features |

We collect data you provide, data generated as you use the app, and verification results from our KYC partner.

## 2. How we use your data
- Verify identity and prevent fraud/abuse;
- Match senders and travellers and operate listings, bids, orders, and escrow;
- Process payments and payouts via our payment partner;
- Enable masked in-app messaging and notifications (push, email);
- Resolve disputes and enforce our Terms;
- Maintain security, debug, and meet legal/tax obligations.

We do **not** sell your personal data.

## 3. Service providers (processors) we share with
We share the minimum necessary with vetted providers that process data on our behalf:
- **Identity verification:** Didit (KYC document + liveness checks)
- **Payments / escrow:** [Razorpay / licensed payment partner]
- **Cloud database & file storage:** Supabase (Postgres) and [AWS S3 / Supabase Storage] — ID documents and photos are stored privately and accessed only via short-lived signed URLs
- **Email:** Brevo (transactional email)
- **Push notifications:** Google Firebase (FCM)
- **Error tracking:** Sentry (diagnostic error data; no document content)
- **Flight verification:** AviationStack (flight number/route check)
- **SMS/OTP:** [Twilio] (where used)

Some providers may process data **outside India**; we rely on appropriate safeguards. *(Counsel to confirm cross-border transfer basis under DPDP.)*

## 4. What other users see
Counterparties in a transaction see a **limited trust profile**: your display name, rating, trip/verification badges, and the masked chat. They do **not** see your ID documents, full contact details, or precise location. Recipients' details are shared with the matched traveller only as needed for delivery.

## 5. Retention & minimisation
- We keep personal data only as long as needed for the purposes above or as law requires.
- **Raw KYC ID images are purged after [180] days** following successful verification; we retain only the verification status and a masked ID number as proof.
- On **account deletion**, we **anonymise** your profile and **purge** your ID images, bank details, and sessions, while retaining **anonymised** transaction/payment records as required for financial, tax, and dispute-audit obligations.

## 6. Your rights (DPDP)
You can, in-app (Profile → Privacy & data) or by contacting us:
- **Access / export** — download a machine-readable copy of your data;
- **Erasure** — delete your account (anonymise + purge), subject to in-flight transactions and legal retention;
- **Correction** — update your profile information;
- **Withdraw consent** — stop further processing (may limit your ability to transact).
We action these requests promptly and within statutory timelines.

## 7. Security
We use TLS in transit, private storage with signed access, hashing/masking of sensitive identifiers (e.g. ID and account numbers), rate limiting, audit logging of admin actions, and least-privilege access. No system is perfectly secure; we work to protect your data and will notify you and the Data Protection Board of qualifying breaches as required.

## 8. Children
CarryMate is not for anyone under 18. We do not knowingly collect data from minors.

## 9. Consent & changes
We record the policy/terms version you consented to at signup. We may update this policy; material changes will prompt renewed consent in-app. The "Last updated" date reflects the current version.

## 10. Grievance Officer (DPDP)
For privacy questions, requests, or complaints:
**[Name]**, Grievance Officer — **[email]** — **[address/phone]**. We will acknowledge and resolve grievances within the timelines required by the DPDP Act.

## 11. Contact
General support: **[support email]**.

---
*This draft maps to the live system: Didit KYC, escrow via the payment partner, private Supabase/S3 storage with signed URLs, Brevo email, Firebase push, Sentry error tracking, AviationStack flight checks, masked chat, and the in-app DPDP export/delete/consent we implemented. Counsel must confirm the cross-border transfer basis, breach-notice specifics, retention periods, and Grievance Officer details.*
