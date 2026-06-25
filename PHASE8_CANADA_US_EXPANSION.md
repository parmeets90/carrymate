# Phase 8 — Canada & USA Corridor Expansion: Regulatory & Strategy Playbook

> **Status:** Planning / due-diligence. No code or launch until the go/no-go gates in §10 are cleared.
> **Scope:** India → Canada and India → USA peer-to-peer traveller-delivery, as an extension of the live India → UAE corridor.
> **Companion docs:** [PLAN.md](PLAN.md) (phases), [ARCHITECTURE.md](ARCHITECTURE.md), [CLAUDE.md](CLAUDE.md) (design constraints).

---

## ⚠️ 0. Read this first — not legal advice + the honest verdict

This document is a **structured regulatory map and product strategy**, compiled from current public sources (June 2026). It is **not legal advice.** Cross-border movement of third-party goods for compensation is one of the most heavily regulated activities that exists, and the rules below are enforced by customs, financial-intelligence, aviation-security, tax, and data-protection authorities **simultaneously**. Before launching either corridor you must retain **licensed counsel in each jurisdiction** (customs/trade, money-transmission/fintech, tax, privacy) and likely a **licensed money-transmission and customs partner**.

**The honest verdict up front:** Canada/USA is **not a "flip a feature flag" expansion** like adding a UAE city. It is effectively **launching a new regulated business in each country**. Three findings (below) are severe enough that the *current* CarryMate model — a sender hands a stranger's package to a paid traveller who carries it through an airport and across a border — **cannot be shipped to the US/Canada as-is without material legal exposure to the traveller, the sender, and the platform.** The viable path requires (a) a **model adjustment**, (b) **financial-licensing infrastructure**, and (c) **corridor-specific rules**. All three are buildable, but they are a multi-quarter, counsel-gated initiative — not a sprint.

---

## 1. The three existential risks (these define the whole strategy)

### Risk A — Aviation security: "never carry items for strangers"
The single most repeated instruction from **TSA** (US) and Transport Canada is: **never accept or carry items for someone you don't know; always pack your own bags.** The CarryMate "sender hands a packed parcel to a traveller" flow asks travellers to do *exactly* the thing security authorities warn against. Consequences for the traveller: they are **personally accountable** for everything in their bag; airlines can **deny boarding**; prohibited/undeclared contents can mean seizure, fines, or criminal liability. This is simultaneously a **safety, legal, and brand** risk and it is structural, not a copy fix.

➡️ **Implication:** the "open-box declaration" we already built (traveller inspects + signs off before transit) is **necessary but not sufficient**. For US/Canada we must go further — see the model adjustment in §6.

### Risk B — US de minimis is GONE (this breaks the old economics)
The **$800 Section 321 duty-free de minimis exemption was suspended for all countries effective 29 August 2025 and remains suspended in 2026.** Every commercial shipment into the US — *regardless of value or method* — now requires **formal customs entry, HTS classification, and full duty payment.** ([CBP fact sheet](https://www.cbp.gov/sites/default/files/2025-08/factsheet_suspension_of_duty-free_de_minimis_treatment.pdf), [White House action](https://www.whitehouse.gov/presidential-actions/2025/07/suspending-duty-free-de-minimis-treatment-for-all-countries/))

Goods that a **paid** traveller carries for a **stranger** are readily characterised by CBP as **commercial** ("brought in for sale or other commercial use must be declared as such"), and **do not qualify for the traveller's personal exemption.** So the assumption that "small parcels slip in duty-free" is dead for the US. Duties + formal entry now attach.

➡️ **Implication:** the US corridor must either (a) confine itself to genuine **gifts/personal items within exemption limits** with duties paid by the traveller, or (b) accept that duties/entry are part of every transaction and price them in. There is no duty-free loophole left.

### Risk C — Moving the money is a licensed activity in all three countries
Collecting the sender's funds, holding them in escrow, and paying out the traveller across borders is **regulated money movement** end-to-end:

| Country | Regime | What it means for us |
|---|---|---|
| **India** | RBI **PA-CB** (Payment Aggregator – Cross Border) under FEMA | Non-bank PA-CB needs **₹15 cr net worth → ₹25 cr by Mar 2026**; per-unit cap **₹25 lakh**. We must either become a PA-CB or route 100% through an **authorised PA-CB / AD bank**. ([RBI PA-CB](https://www.pwc.in/industries/financial-services/fintech/payments/cross-border-payment-aggregators-regulations-and-business-use-cases.html)) |
| **USA** | FinCEN **MSB** + **state money-transmitter licences** | Escrow **can** avoid money-transmitter status **only if** the money movement is "necessary and integral" to escrow **and** the platform **verifies/validates that obligations were discharged** before releasing funds. Otherwise it's pure money transmission → MSB registration **+ a licence in (nearly) every state**. ([FinCEN ruling](https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1)) |
| **Canada** | **FINTRAC** MSB (incl. *foreign* MSB serving Canadians) | Registration + full AML programme (compliance officer, KYC, monitoring, training). **Bill C-12 (Mar 2026)** raised penalties to the greater of **C$20M or 3% of global revenue**. ([FINTRAC MSB](https://fintrac-canafe.canada.ca/msb-esm/msb-eng)) |

➡️ **Implication:** do **not** build our own cross-border wallet/escrow. Use **licensed payment + escrow partners** in each leg, and structure release to satisfy the FinCEN "integral-to-escrow + verified-obligations" test so we are not ourselves a money transmitter. This is a financial-licensing decision, not a coding one.

---

## 2. Customs & import — per corridor

### 2.1 USA (CBP)
- **Declaration:** every traveller completes **CBP Form 6059B**; goods "for sale or other commercial use" or **for another person** must be declared as such and **do not get the personal exemption.** ([Know Before You Go](https://www.cbp.gov/travel/us-citizens/know-before-you-go/know-you-go-traveling-abroad))
- **De minimis:** **suspended** (Risk B). Duties + formal/informal entry now attach; **informal entry** generally for < $2,500, but **not** usable for some commercial/quota goods. ([19 CFR 143-C](https://www.ecfr.gov/current/title-19/chapter-I/part-143/subpart-C))
- **Gifts:** bona-fide gift exemption is only **$100** (and that's for gifts *received*, narrow conditions).
- **Currency:** carrying **> $10,000** (or doing so *for someone else*) requires **FinCEN 105** — explicitly triggered by "someone else carry currency for you."
- **Customs-broker line (19 CFR 111):** "customs business" (classification, valuation, paying duties on another's merchandise) requires a **licensed broker**; a POA must be **directly with the importer**, not via an unlicensed third party. ([19 CFR 111](https://www.ecfr.gov/current/title-19/chapter-I/part-111)) ➡️ **We must keep the platform entirely OUT of customs business** — the traveller is the importer of record and handles their own declaration.

### 2.2 Canada (CBSA / CFIA)
- **Carrying for others:** goods you bring in **for commercial use or for another person do NOT qualify** for the personal exemption and are subject to duty/taxes (GST/HST/PST). ([I Declare](https://www.cbsa-asfc.gc.ca/travel-voyage/declare-eng.html))
- **CAD $60 gift exemption:** applies to gifts **sent by mail/courier**, *not* to gifts physically carried in for another person — a critical distinction that defeats a naive "it's a gift" framing. ([What you can bring](https://travel.gc.ca/returning/customs/what-you-can-bring-home-to-canada))
- **Currency:** **CAD $10,000+** must be declared.
- **Enforcement:** CBSA enforces CFIA/Health-Canada/ECCC rules at the border.

---

## 3. Prohibited & restricted items — must expand the rules engine per corridor

Our current prohibited screening is tuned for India→UAE. Each new corridor needs its **own** ruleset. Highlights:

### USA
- **Drugs/medicines:** generally **illegal** for individuals to import drugs into the US; narrow **90-day personal-use** exception with strict conditions (serious condition, no US treatment, original container/Rx, no commercialisation). DEA governs controlled substances. ([FDA personal importation](https://www.fda.gov/industry/import-basics/personal-importation)) ➡️ **Hard-block medicines** on the marketplace.
- **Food:** allowed for personal use but **prior notice** may apply; **USDA/APHIS** restricts meat, produce, plants, seeds.
- **Currency** > $10k (FinCEN 105); counterfeit goods, ivory/wildlife, weapons → block.

### Canada
- **Meat: prohibited** for personal import **regardless of quantity or origin**; **ghee/butter-oil** restricted from animal-disease-risk countries (directly affects common India→Canada food items). ([CFIA bring food](https://inspection.canada.ca/en/food-safety-consumers/bring-food-personal-use))
- **Plants/produce/seeds:** disease-based restrictions (e.g. stone fruit, certain plants).
- **Medicines:** Health Canada restrictions mirror the US posture → **block**.

➡️ **Engineering:** the prohibited engine must become **corridor-aware** (`{originCountry, destCountry} → ruleset`), and the existing India→UAE list stays unchanged. Categories like FOOD that pass to UAE may be **blocked or narrowed** to Canada (meat/ghee) and the US.

---

## 4. Tax & platform reporting

- **Canada — Reporting Rules for Digital Platform Operators** (OECD model, in force **since 1 Jan 2024**): we must **collect, verify, and report each reportable seller's (traveller's) info + income to the CRA annually (by Jan 31)** and give the seller a copy. ([CRA rules](https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/reporting-rules-digital-platforms.html)) GST/HST registration likely required.
- **USA — Form 1099-K:** third-party settlement orgs report payees over **$20,000 and 200 transactions** (2025 threshold; subject to change). Travellers earning carry fees may need 1099-Ks. ([IRS 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k))
- **India:** income to Indian travellers, TDS/GST considerations; FEMA reporting via the PA-CB rails.

➡️ **Engineering:** capture and store the data these regimes require (traveller legal name, address, TIN/SIN, payout totals) from day one of each corridor — retrofitting tax reporting is painful.

---

## 5. Aviation security & data privacy (quick reference)

- **Security:** see Risk A. Mandatory traveller education + attestation; consider limiting to **carry-on-visible, sender-photographed, traveller-inspected** items only; never sealed/opaque parcels.
- **Privacy:** add **PIPEDA + Quebec Law 25** (Canada) and applicable **US state laws (CCPA/CPRA et al.)** to the DPDP work we already shipped. Our export/delete/consent plumbing generalises, but consent text, retention, and breach-notice timelines differ per jurisdiction.

---

## 6. Strategic recommendation — adjust the model before crossing these borders

The lower-risk structure (validated by how incumbents like **Grabr** operate) is to move away from "**carry my sealed package**" toward one of:

1. **Concierge / "buy-for-me"** — the traveller **purchases the item abroad with their own money** and hand-delivers; the sender reimburses + fee through the platform. Because the traveller owns the goods at the border, there's **no stranger's-package-at-security problem** and the personal/gift framing is cleaner. (Grabr survives in a "grey area" precisely because *no reselling technically occurs*. Customs duty is **100% the traveller's responsibility**, disclaimed by the platform.)
2. **Gifts between known parties**, within exemption limits, traveller-packed and declared.

For genuine sender→recipient parcels (our current core), US/Canada requires **strict structuring**:
- **Traveller is always the importer of record**; platform never touches customs business (§2.1 broker rule).
- **Open, photographed, traveller-inspected contents only** — no sealed/opaque parcels (Risk A).
- **Duties/taxes disclosed and borne by the traveller**, surfaced in the price (Risk B).
- **Hard corridor-specific prohibited blocks** (§3).
- **Mandatory traveller attestation**: "I packed/inspected this, I will declare it, I accept customs responsibility."
- **Licensed money rails** so we're not an unlicensed transmitter (Risk C).

➡️ **Recommendation:** launch Canada/US on the **concierge/gift model first** (lower risk, proven), and treat full sender-parcel carry as a **later, counsel-blessed** capability — or keep it UAE-only.

---

## 7. Infrastructure you'd need before launch (non-code)

- **Legal entities / counsel** in IN, US, CA (customs/trade, fintech/MTL, tax, privacy).
- **Money movement:** authorised **PA-CB/AD-bank** partner in India; **MSB + state MTLs** *or* a licensed **escrow/PSP partner** in the US whose structure satisfies the FinCEN integral-to-escrow test; **FINTRAC** registration/partner in Canada. (You currently have **no payment gateway at all** — this is the critical-path dependency.)
- **Tax registrations:** CRA platform-operator + GST/HST; US 1099-K issuance; India GST/TDS.
- **Insurance:** cross-border liability + the (currently "coming soon") claims path.
- **Customs guidance partner** so travellers get accurate per-corridor declaration help **without** us doing "customs business."

---

## 8. Technical work (what *we* build — behind flags, no launch until §10)

All of this is additive and flag-gated (`ENABLE_CANADA`, `ENABLE_USA` already exist, default off):

1. **Corridor model** — generalise the hard-coded India→UAE corridor into a `Corridor {originCountry, destCountry, status}` config with per-corridor rules.
2. **Corridor-aware prohibited engine** — `(category, originCountry, destCountry) → allow/block/needs-review`; encode US (drugs/meat/produce) and Canada (meat/ghee/plants) rules; leave UAE untouched.
3. **Customs & duty disclosure flow** — per-corridor declaration guidance, duty-responsibility attestation, "you are the importer of record" acknowledgement.
4. **Concierge/buy-for-me flow** (if we adopt §6 model) — request-to-purchase, receipt upload, reimbursement + fee.
5. **Tax-data capture** — traveller legal identity, address, TIN/SIN, payout aggregation for CRA/IRS reporting.
6. **Per-corridor KYC** — passport + destination-appropriate identity checks; Didit workflow per geography.
7. **Money-rail abstraction** — pluggable PSP/escrow per corridor (so India→UAE Razorpay path is untouched).
8. **Privacy** — extend DPDP export/delete/consent to PIPEDA/Law 25/US-state nuances.
9. **Currency-threshold + value-cap guards** per corridor (US $10k FinCEN 105, CA $10k, gift/value limits).

---

## 9. Risk matrix

| # | Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|---|
| A | Traveller carries stranger's goods (security) | **Critical** | High | Concierge model / open-inspected-only items / attestation / education |
| B | US duties on every parcel (de minimis gone) | **High** | Certain | Price duties in; gifts-within-limits; traveller pays + declares |
| C | Unlicensed money transmission (IN/US/CA) | **Critical** | High | Licensed PA-CB/MSB/escrow partners; FinCEN integral-to-escrow structuring |
| D | False customs declaration (personal vs commercial) | **Critical** | Medium | Traveller = importer of record; truthful declaration flow; no platform "customs business" |
| E | Prohibited item crosses (drugs/meat) | **High** | Medium | Corridor-specific hard blocks; KYC; audit |
| F | Tax-reporting non-compliance (CRA/IRS) | Medium | High | Capture data day 1; platform-operator + 1099-K reporting |
| G | Privacy non-compliance (PIPEDA/Law 25/CCPA) | Medium | Medium | Extend DPDP work per jurisdiction |
| H | Customs-broker licensing breach (19 CFR 111) | High | Low–Med | Keep platform out of customs business entirely |

---

## 10. Phased rollout + go/no-go gates

**Gate 0 — Strategy lock:** decide model (§6): concierge/gift vs full parcel carry. *(Founder + counsel)*
**Gate 1 — Legal/financial readiness:** counsel retained per country; money-rail + escrow partners signed (FinCEN-safe structure); tax/privacy registrations mapped. **No build of corridor launch until this clears.**
**Gate 2 — Build (flagged, internal):** §8 technical work; corridor rules engine; per-corridor prohibited lists; declaration + tax-data flows; per-corridor KYC. Ships behind `ENABLE_CANADA`/`ENABLE_USA` = off.
**Gate 3 — Compliance dry-run:** counsel review of the actual flows, copy, declarations, and money path; pen-test; tax-reporting test.
**Gate 4 — Closed pilot, one corridor:** pick **one** (recommend **India→Canada** — slightly more navigable food rules debate aside; or whichever counsel prefers), tiny cohort, watch seizures/disputes/chargebacks; any spike pauses.
**Gate 5 — Scale** only after a clean pilot.

> **Sequencing note:** Gate 1 (money licensing) is the long pole and the hard dependency — you currently have **no payment gateway**, so even the live UAE corridor's real-money path (Gap C) is unbuilt. **Stand up licensed money movement for UAE first**, prove it, then extend the abstraction to CA/US. Don't start CA/US money licensing cold.

---

## 11. Open questions for counsel (hand this list over)

1. Does our escrow release logic satisfy FinCEN's "necessary-and-integral + verified-obligations" test, or are we a money transmitter needing state MTLs?
2. Can we operate India→US/CA money movement entirely through a licensed PA-CB + foreign PSP without holding funds ourselves?
3. Under the concierge model, is the traveller's purchase-and-deliver clearly outside "customs business" for the platform (19 CFR 111)?
4. What item categories are defensibly allowed per corridor, and what value/gift caps keep travellers within personal exemptions?
5. Canada digital-platform-operator + GST/HST obligations and US 1099-K issuance — who is the "platform operator" of record?
6. Airline/security posture: is there *any* compliant way to facilitate sender-parcel carry, or must Canada/US be concierge-only?
7. Insurance product for cross-border carry + the claims path we currently defer.

---

## 12. Sources (June 2026)
- US de minimis suspension — [CBP fact sheet](https://www.cbp.gov/sites/default/files/2025-08/factsheet_suspension_of_duty-free_de_minimis_treatment.pdf), [White House](https://www.whitehouse.gov/presidential-actions/2025/07/suspending-duty-free-de-minimis-treatment-for-all-countries/), [CRS](https://www.congress.gov/crs-product/R48380)
- US CBP traveller declarations — [Know Before You Go](https://www.cbp.gov/travel/us-citizens/know-before-you-go/know-you-go-traveling-abroad), [Form 6059B](https://www.cbp.gov/sites/default/files/2024-07/cbp_form_6059b_english_0.pdf), [Informal entry 19 CFR 143-C](https://www.ecfr.gov/current/title-19/chapter-I/part-143/subpart-C)
- US customs brokers — [19 CFR 111](https://www.ecfr.gov/current/title-19/chapter-I/part-111)
- US money transmission/escrow — [FinCEN escrow ruling](https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1), [FinCEN MSB registration](https://www.fincen.gov/resources/money-services-business-msb-registration)
- US FDA/drugs — [Personal importation](https://www.fda.gov/industry/import-basics/personal-importation), [Human drug imports](https://www.fda.gov/drugs/guidance-compliance-regulatory-information/human-drug-imports)
- US tax — [IRS 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k)
- Canada customs — [I Declare](https://www.cbsa-asfc.gc.ca/travel-voyage/declare-eng.html), [What you can bring](https://travel.gc.ca/returning/customs/what-you-can-bring-home-to-canada)
- Canada CFIA food — [Bring food for personal use](https://inspection.canada.ca/en/food-safety-consumers/bring-food-personal-use)
- Canada FINTRAC MSB — [MSBs](https://fintrac-canafe.canada.ca/msb-esm/msb-eng)
- Canada platform tax reporting — [CRA digital platform rules](https://www.canada.ca/en/revenue-agency/programs/about-canada-revenue-agency-cra/compliance/reporting-rules-digital-platforms.html), [EY alert](https://www.ey.com/en_gl/technical/tax-alerts/canada-s-new-reporting-rules-for-digital-platform-operators-take)
- India PA-CB / FEMA — [PwC PA-CB](https://www.pwc.in/industries/financial-services/fintech/payments/cross-border-payment-aggregators-regulations-and-business-use-cases.html), [Lexology](https://www.lexology.com/library/detail.aspx?g=2e51a27b-3fa8-47a1-b2de-b660f6548211)
- Incumbent model — [Grabr customs FAQ](https://help.grabr.io/hc/en-us/articles/115004005394-What-are-customs-duties-Do-I-need-to-collect-or-pay-them), [Grabr Terms](https://grabr.io/en/terms)

---

*Compiled June 2026 for CarryMate. Re-verify every figure with counsel before relying on it — customs, de minimis, money-transmission, and tax rules change frequently and several changed materially in 2025–2026.*
