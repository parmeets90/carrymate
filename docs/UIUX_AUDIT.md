# CarryMate — Complete UI/UX Audit & Implementation Blueprint

> **Role:** Senior Product Designer · UX Researcher · React Native UI Architect
> **Method:** Audited every screen, component, and flow against the **ui-ux-pro-max** rule set (accessibility, touch, performance, style, layout, typography/color, animation, forms, navigation) and the **minimalist-ui** editorial lens (typographic hierarchy, macro-whitespace, flat surfaces, scarce semantic color).
> **Benchmarks:** Airbnb, Uber, Revolut, Stripe, Notion, Linear.
> **Scope:** Analysis + blueprint only. **No code changed.** No functionality/API/navigation/architecture changes proposed — visual & interaction layer only.

---

## 0. The two lenses, reconciled → CarryMate's North Star

The two skills pull in different directions, so first a single coherent target:

- **ui-ux-pro-max** → premium *consumer-mobile* polish (motion, haptics, trust signals, depth).
- **minimalist-ui** → *editorial restraint* (typography does the work; color is scarce; surfaces are flat; whitespace is structural).

CarryMate is a **trust-first money product**, not a document tool — so the primary direction is **ui-ux-pro-max**, *disciplined by* minimalist-ui. The North Star:

> **"Warm, trustworthy fintech minimalism."** White/bone surfaces, hairline borders, one strong type hierarchy, generous whitespace, and **color reserved for meaning** (gold = identity, mint = money, red = danger, amber = pending). Motion is quiet and meaningful. Depth comes from soft, low-opacity shadows — never heavy gradients.

**Immediate implication / open tension:** the recently-added **alternating pastel list backgrounds** read closer to a wellness app than to Revolut/Stripe. Both skills caution against decorative color. **Recommendation (High):** demote pastels from "every card" to a **scarce accent** — flat white cards with a hairline border + strong type hierarchy, and pastel reserved for a single hero/section or status tints. (See §4.4.) This is the single biggest "premium vs. playful" lever.

---

## 1. Executive summary & maturity scorecard

CarryMate is already **above-average** for an MVP: a real token system, Phosphor iconography, a coin-flip brand loader, themed alerts, trust badges, an onboarding carousel, and reduce-motion awareness. The gap to "Revolut-grade" is **consistency, hierarchy, state design (skeletons/haptics), accessibility, and dark mode** — not a ground-up redesign.

| Dimension | Score /5 | One-line verdict |
|---|---|---|
| Visual hierarchy | 3.0 | Cards uniform; hierarchy leans on color, not type weight/size |
| Layout & grid | 3.5 | Solid 4/8 spacing; some screens lack rhythm tiers |
| Color palette | 3.0 | Strong semantic system; pastel accent risks overuse |
| Typography | 3.5 | Good pairing (Jakarta + Inter); scale under-exploited |
| Icons & illustration | 4.0 | Consistent Phosphor; duotone auth art is a highlight |
| Cards & components | 3.5 | Clean; need elevation discipline + one card system |
| Buttons & inputs | 3.5 | Good sizes; inputs/states need unification |
| Navigation & tab bar | 3.5 | Clear 5-tab model; missing badges + active polish |
| Empty states | 4.5 | Recently fixed — actionable (rule 10) ✅ |
| Loading / skeleton | 2.0 | Spinner-only; **no skeletons/shimmer** |
| Success/error/confirm | 3.0 | Themed alerts good; no celebratory success moments |
| Micro-interactions | 3.0 | Press scale exists; sparse elsewhere |
| Motion & transitions | 3.0 | Tokens exist; not consistently applied |
| Haptics | 1.0 | **None** |
| Trust UI | 4.0 | Badges/escrow copy strong — the product's best asset |
| Accessibility | 2.5 | Labels/contrast/dynamic-type gaps |
| Dark mode | 1.0 | **Not built** |
| Overall consistency | 3.0 | Good bones; drift between older and newer screens |

**Headline:** ~**3.1/5** today → a credible **4.3/5** is reachable with the Quick Wins + Medium tier in §9, mostly token- and component-level work that propagates app-wide.

---

## 2. Cross-cutting findings (the patterns that recur everywhere)

These are worth fixing **once at the system level** because they touch most screens:

1. **Hierarchy is carried by color, not type.** Cards repeat `bodyL/600` titles + `bodyM` meta. Revolut/Linear establish hierarchy with **size + weight + whitespace** so color can stay scarce. → Strengthen the type scale usage (§3.2).
2. **No skeletons.** Every list shows the coin loader. Premium apps show **layout-shaped shimmer** (perceived speed, no layout shift). → §5.1.
3. **No haptics.** Money/trust moments (escrow lock, delivery confirm, KYC verified, bid accept, error) should have **tactile confirmation**. → §6.3.
4. **Elevation is inconsistent.** `Card` uses `shadows.sm`; alerts `shadows.lg`; some rows none. Define a **strict elevation ladder** and stop ad-hoc shadows. → §3.5.
5. **Color discipline slipping.** Pastel-everywhere dilutes the semantic system. Reserve color for meaning. → §4.4.
6. **Accessibility gaps.** Icon-only `Pressable`s lack `accessibilityLabel`; `skyBlue (#4FA3E0)` as *text/link* on white is ~2.4:1 (fails AA); no Dynamic Type testing. → §7.
7. **No theming layer.** Hardcoded `colors.*` everywhere blocks dark mode. → §3.1 + §8.
8. **Inconsistent screen scaffolding.** Some screens use `GradientHero`, others bespoke headers, others none. → One `ScreenHeader` system (§4).
9. **Numbers aren't tabular.** ₹ amounts, timers, ratings shift width. Use tabular figures. → §3.2.
10. **Motion tokens exist but are under-used.** `motion.*` is defined but most transitions are default. → §6.

---

## 3. Target Design System

### 3.1 Color — tokenize for light **and** dark (semantic, not raw)

Keep the existing brand semantics; the change is **structure** (semantic roles + theme-ready) and **discipline** (color = meaning).

**Brand & semantic (unchanged intent, confirm contrast):**
| Role | Light | Notes |
|---|---|---|
| `primary` (CTA) | `#1E40AF` / `#3B82F6` | Use the deeper `#1E40AF` for text-on-white links to pass AA; `skyBlue #4FA3E0` is fine as **button fill** with white text, **not** as text on white |
| `accent` (money) | `#1DB574` mint | escrow/delivery only |
| `trust` (gold) | `#E0931A` | KYC/flight/ratings only |
| `danger` | `#E84040` | disputes/destructive only |
| `pending` | `#F5C800` amber | in-transit/pending only |
| Surfaces | `bgApp #F5F6F8`, `bgCard #FFF`, `bgSecondary #F0F2F5` | |
| Text | `#1C2330 / #5E6878 / #8E97A8` | primary/secondary/hint |
| Pastel accents | softBlue/mint/peach/lavender | **scarce** — hero/section/status tint only |

**Action items**
- **Fix `skyBlue` text contrast (High, S):** anywhere `skyBlue` is used as *text* (links, "View", "Place a bid →", CTA labels on light bg) swap to `#1E40AF` (navy-blue) or darken to `#2C7BC4`. As a **fill** behind white text it's fine.
- **Introduce a `theme` object with semantic tokens** (`color.bg`, `color.surface`, `color.textPrimary`, `color.border`, `color.primary`…) so screens stop importing raw `colors.*`. This is the unlock for dark mode (§8). (Medium, L — mechanical but broad.)

### 3.2 Typography — exploit the scale you already have

Pairing (Plus Jakarta Sans display + Inter body) is **good and on-trend** (Linear/Notion-adjacent). It's under-used.

- **Define and *use* roles:** `display 28/600`, `titleL 22/600`, `titleM 18/600`, `bodyL 16/400`, `bodyM 14/400`, `label 12/500`, `caption 11/400`. Add **`numeric` (tabular figures)** for ₹, timers, ratings, counts (`fontVariant: ['tabular-nums']`). (High, S)
- **Raise heading weight contrast:** card titles → `titleM/600` (not `bodyL/600`); screen titles → `titleL`/`display`. Let size+weight carry hierarchy so color can recede. (High, M)
- **Line-height & measure:** body `1.5`; legal/long text already good. Keep paragraph measure ≤ ~60 chars.
- **Letter-spacing:** keep display `-0.5`; avoid tight tracking on `bodyM`.

### 3.3 Spacing & grid
- Keep **4/8** base. Formalize **rhythm tiers**: component `8/12`, intra-section `16`, inter-section `24/32`, screen top `24`. Audit screens for ad-hoc gaps.
- Screen horizontal padding stays **16**. Consider **20** on hero/marketing screens for a more premium gutter.
- Lists: consistent item gap (12) + first/last insets so content never hides under the tab bar / safe area.

### 3.4 Radius
Recently softened (card 16, button/input 12, chip 20, sheet 20). **Good.** Keep. Minimalist-ui would argue for crisper 8–12; the consumer-trust direction supports 12–16. **Do not exceed 20 on large cards** (avoid the "wellness app" softness). One change: **inputs and buttons should share the same radius (12)** — already true; enforce everywhere.

### 3.5 Elevation & shadow — define a strict ladder (stop ad-hoc)
| Level | Use | Spec (keep low-opacity) |
|---|---|---|
| `e0` flat | list rows (minimalist default) | none + `1px` hairline border `#E0E3E9` |
| `e1` | resting cards | `shadows.sm` (y2, blur6, 0.06) |
| `e2` | sheets, sticky CTA bars | `shadows.md` |
| `e3` | modals/alerts, FAB | `shadows.lg` |
**Rule:** a screen uses **at most two** elevation levels. Prefer **hairline borders over shadows** for in-list cards (minimalist lens + perf). (Medium, M)

### 3.6 Iconography
Phosphor is consistent — **keep**. Tighten:
- **One weight per hierarchy:** `regular` for inline/nav, `fill` for active/selected and trust badges. Avoid mixing on the same row. (Low, S)
- **Token sizes only:** `icon-sm 16 / icon-md 20 / icon-lg 24`. Audit stray 13/15/18. (Low, S)
- **Every icon-only tap target gets `accessibilityLabel` + ≥44pt hit area** (`hitSlop`). (High, M — a11y.)

### 3.7 Motion guidelines (you already have `motion.*` tokens — apply them)
- Micro (press/toggle) **120–180ms ease-out**; screen/sheet **240–320ms**; **exit ~70% of enter**.
- **Springs** for sheets/cards (`motion.spring.tactile`); **ease-out** for fades.
- **Stagger** list entrance 40–55ms/item (you have `FadeInUp` + `motion.stagger` — apply to all lists).
- **Always** gate on `useReducedMotion()` (already a hook — enforce in every animated component).
- Animate **transform/opacity only**.

### 3.8 Haptics (new) — a small library, big premium lift
Add `react-native-haptic-feedback` and a `haptics.ts` wrapper with semantic calls: `success` (delivery confirmed, KYC verified, payout), `impactLight` (tab switch, card press, toggle), `warning` (dispute opened), `error` (failed payment/validation), `selection` (OTP digit, picker). (Medium, S–M.)

---

## 4. Screen-by-screen audit

Format per item: **Issues → Why it matters → Proposed redesign → Priority → Effort → Inspiration.**
Effort key: **S** ≤2h · **M** ½–1 day · **L** 1–3 days (visual layer only).

### 4.1 Splash
- **Issues:** Native plane→gift→wordmark sequence is charming but ~3.5s is long for repeat launches; no skip; brand wordmark uses system fallback if fonts not yet loaded.
- **Why:** Long unskippable splashes feel slow on the 2nd+ launch (Uber/Revolut keep it <1.5s).
- **Redesign:** Cap the *blocking* splash at ~1.2–1.5s; let the full animation play only on **first launch** (store a flag); ensure fonts are ready before wordmark. Keep the delightful version for onboarding.
- **Priority:** Medium · **Effort:** S · **Inspo:** Revolut (sub-second), Duolingo (first-run only).

### 4.2 Auth — Phone & OTP *(recently redesigned ✅)*
- **Issues:** Strong now (carousel + pastel hero + sheet). Remaining: disclaimer text is tiny (`fontSize 10`) and dense; "G" Google glyph is a text char, not the official mark; carousel has no swipe-hint on first view; consent links small.
- **Why:** Legal/consent must be legible (a11y + trust); fake-looking Google "G" undermines polish; <12px text fails readability rules.
- **Redesign:** Disclaimer → `caption 11` min, 2 lines max with "Terms"/"Privacy" as clearly tappable; use the **official Google "G" SVG**; add a subtle one-time swipe affordance on the carousel; ensure the form sheet clears the keyboard on small phones.
- **Priority:** Medium · **Effort:** S–M · **Inspo:** Airbnb auth, Revolut onboarding.

### 4.3 Onboarding Profile & KYC
- **Issues:** Onboarding `ProfileScreen` (name) and `KycScreen` use a different, plainer language than the new auth screens; KYC "Verify my identity" is functional but not reassuring enough for a step where users hand over a passport; no progress indicator across signup → profile → KYC.
- **Why:** KYC is the **highest-anxiety, highest-drop** step; trust cues + progress reduce abandonment (rule: `multi-step-progress`).
- **Redesign:** Add a **3-step progress indicator** (Phone → Profile → Verify) reused across the flow; bring the pastel-hero + duotone illustration language into KYC; add trust microcopy ("Bank-grade encryption · ~2 min · we never store your raw ID after verification") with small lock/seal icons; success state on verified = **celebratory** (confetti/Lottie + haptic.success). 
- **Priority:** **High** · **Effort:** M · **Inspo:** Revolut/Wise KYC, Stripe Identity.

### 4.4 Marketplace lists — Browse / Trips / My Bids / My Requests / Orders
- **Issues:** (1) **Alternating pastel backgrounds** read playful, not premium, and reduce text contrast on peach/lavender. (2) Cards are uniform — hard to scan the most important field (route? price? status?). (3) Loaders are spinners, not skeletons. (4) Card title is `bodyL` not a true heading.
- **Why:** Scannability + perceived speed + "premium" perception are decided here (these are the home screens). Color-tinted card bodies fight the trust palette and hurt contrast (a11y).
- **Redesign:**
  - **Demote pastel:** flat **white cards + hairline border**, hierarchy via type (route in `titleM`, price in `numeric/titleM`, status as a single semantic badge). Use a pastel only as a **left status rail** (3px) or a single tint on the *active/selected* card. *(This is the highest-leverage premium change.)*
  - **Add skeletons** matching card shape (§5.1).
  - **Stagger** entrance (40ms) — already have `FadeInUp`.
  - Give each card **one clear primary affordance** + obvious tap area.
- **Priority:** **High** · **Effort:** M (system change, propagates) · **Inspo:** Airbnb listings, Uber trip cards, Linear list rows.

### 4.5 Request/Bid detail & forms — CreateRequest / AddRoute / PlaceBid / RequestDetail
- **Issues:** Long single-column forms (CreateRequest is long); inputs lack persistent helper text and inline validation (errors appear after submit); the **DateField** (pure-JS calendar) is functional but visually basic; autocomplete dropdown styling differs from inputs; "Post request" CTA not pinned (scroll to submit).
- **Why:** Forms are where money/trust decisions happen; `inline-validation`, `input-helper-text`, `multi-step-progress`, and a **pinned primary CTA** materially improve completion.
- **Redesign:**
  - Group fields into **sections with subheads** (Item · Route · Recipient · Photos) — progressive disclosure.
  - **Pinned bottom CTA bar** (sticky "Post request"/"Place bid") with a soft top shadow; price/fee summary lives in it.
  - **Inline validation on blur**, helper text under complex fields (weight cap, value cap, deadline rule), focus first invalid field on error.
  - Unify **input ↔ autocomplete ↔ date** styling (same height/radius/border/focus ring).
  - PlaceBid: show a **live fee breakdown** (carry fee → commission → you earn) with mint accent + lock icon.
- **Priority:** **High** · **Effort:** M–L · **Inspo:** Stripe Checkout forms, Airbnb "create listing".

### 4.6 Fulfillment — Open-Box / Deliver / Dispute / Rate + Order tracking
- **Issues:** The **delivery Timeline** is the emotional core but is a thin 4-dot strip; Open-Box (camera checklist) and Deliver (proof) are utilitarian; Rate uses gold stars (good) but no celebratory completion; Dispute is reachable but visually alarming.
- **Why:** This is the **trust payoff** — where reassurance ("Arjun is in the air…", CLAUDE rule 6) and delight earn retention and referrals.
- **Redesign:**
  - **Upgrade the Timeline** into a proper vertical tracker with state copy, timestamps, and a **subtle animated in-transit indicator** (plane translate / pulsing node — you have `anim.tsx` PlaneTrack/Pulse). Add the **escrow-lock stroke-draw** moment (CLAUDE Animation Spec) on payment.
  - **Delivery confirmed = a moment:** confetti/Lottie + `haptic.success` + a clear "Funds released" mint card.
  - **Rate screen:** celebratory header, animated star fill, optional quick-tag chips ("On time", "Careful", "Friendly").
  - **Dispute:** keep reachable in ≤2 taps but make the *entry* calm (neutral, "Need help with this delivery?") — reserve red for the actual destructive confirm.
- **Priority:** **High** (tracking/confirm), Medium (rate/dispute) · **Effort:** M–L · **Inspo:** Uber live tracking, DoorDash delivery, Airbnb trip timeline.

### 4.7 Chat & Notifications
- **Issues:** Optimistic send + coin loader is nice; bubbles are functional; the **PII-masked** notice is valuable but could be friendlier; no typing indicator / seen receipts in-thread polish; Notifications list lacks grouping (Today/Earlier) and per-type icons/color.
- **Why:** Chat is a primary trust surface; grouping + iconography aids scanning; the masking message is a *trust feature* — present it as reassurance, not a warning.
- **Redesign:** Date separators + grouped notifications with semantic type icons; refine bubble radii/spacing and timestamps (tabular); reframe the PII notice as a small **shield chip** ("Protected chat"); add a subtle typing indicator. 
- **Priority:** Medium · **Effort:** M · **Inspo:** WhatsApp/iMessage grouping, Airbnb messages.

### 4.8 Profile / User trust profile / Wallet (Transactions)
- **Issues:** ProfileTab is a long stack of section labels + cards (recently compacted ✅); avatar is a gradient-initials circle (fine, but a real photo/illustration would feel more premium); **UserProfile** (counterparty trust profile) is the conversion surface for accepting a stranger — it should *sell trust* harder (trust meter, verified facets, trip history, ratings distribution). Wallet/Transactions is plain.
- **Why:** The counterparty profile is where a sender decides to trust a traveller — the strongest lever for conversion and safety perception.
- **Redesign:** UserProfile → **trust dashboard**: big verified header, **trust meter**, badge stack, "N trips · X.X★" with a tiny ratings bar, recent reviews, "open-box record". Wallet → clearer escrow/earnings hierarchy with `numeric` amounts and status chips.
- **Priority:** **High** (UserProfile), Medium (Wallet) · **Effort:** M · **Inspo:** Airbnb host profile, Uber driver card, Revolut activity.

### 4.9 Navigation & tab bar
- **Issues:** 5-tab model is correct; missing **unread badges** (Chat/Notifications), active state could be stronger, no haptic on tab switch.
- **Why:** Badges drive re-engagement; active clarity is a baseline premium cue.
- **Redesign:** Add badge dots/counts (clear on visit), bolder active tint + label weight, `haptic.selection` on switch, ensure tab bar respects safe-area inset (it does — verify on gesture-nav devices). Keep ≤5 (rule).
- **Priority:** Medium · **Effort:** S–M.

### 4.10 Alerts / sheets / modals *(themed AlertHost ✅)*
- **Issues:** Good themed dialog; stack-vs-row button logic recently fixed ✅; no swipe-to-dismiss on sheets; scrim opacity check.
- **Redesign:** Use bottom **sheets** (slide-from-trigger) for choices instead of center alerts where appropriate; ensure scrim 40–60% black; swipe-down dismiss; confirm-before-dismiss on dirty forms.
- **Priority:** Low–Medium · **Effort:** M.

---

## 5. State design

### 5.1 Loading → **Skeletons & shimmer** (currently missing — high impact)
Replace list/detail spinners with **layout-shaped skeleton cards** (animated shimmer via `Animated`/reanimated, reduce-motion → static gray). Keep the coin `BrandLoader` only for **full-screen/app-boot** and inline button busy states. (High, M — build a `Skeleton`/`SkeletonCard` component once, reuse.) *Inspo: Linear, Facebook, Airbnb.*

### 5.2 Empty states *(✅ recently fixed — actionable)*
Keep. Optionally add the small monochrome line-illustration motif (minimalist-ui) instead of a single icon for the most important empties (Browse/Trips).

### 5.3 Success / error / confirmation
- **Success moments are missing.** Add celebratory confirmations for: KYC verified, escrow held, delivery confirmed, payout released (Lottie + haptic.success + concise "what's next"). 
- **Errors:** ensure every error states **cause + recovery** (retry/edit/help), appears near the field or as a non-blocking toast with `aria-live`. Add a lightweight **Toast** component (auto-dismiss 3–5s, swipe-away) — currently alerts are modal-heavy. (Medium, M)

---

## 6. Micro-interactions, motion, Lottie & haptics

### 6.1 Micro-interactions (add tasteful feedback)
Card press scale (have `Pressable3D` — apply consistently), button press scale, input focus ring animation, badge "pop" on state change, star fill on rate, checkmark draw on open-box items. 1–2 animated elements per view max.

### 6.2 Page transitions
Adopt consistent **directional** stack transitions (forward = slide-left/up, back = reverse) and **shared-element** for list→detail where feasible (e.g., card → request detail). Sheets animate from trigger. (Medium, M.)

### 6.3 Haptics (see §3.8) — **highest delight-per-effort** item. (Medium, S–M.)

### 6.4 Lottie opportunities (you removed it from splash; reintroduce *surgically*)
High-value, low-risk Lottie moments: **KYC verified** ✓, **escrow locked** 🔒 (stroke-draw), **delivery success** confetti, **empty Browse** (subtle looping). Keep files tiny (<30KB), solid fills only (you learned gradient-stroke isn't supported), and gate on reduce-motion. **Do not** loop heavy animations on list screens (perf).

---

## 7. Accessibility audit (currently the biggest correctness gap)

| Check | Status | Action | Pri |
|---|---|---|---|
| Color contrast (text) | ⚠️ `skyBlue` text ~2.4:1 on white | Use `#1E40AF` for text/links | **High** |
| Icon-only buttons labelled | ❌ many | Add `accessibilityLabel` + `accessibilityRole="button"` | **High** |
| Touch targets ≥44pt | ⚠️ some 13–16px icons | `hitSlop`/min sizes | **High** |
| Dynamic Type | ❌ untested | Test largest size; avoid fixed-height text rows that clip | Medium |
| Reduce-motion | ⚠️ partial | Enforce `useReducedMotion()` in **every** animated comp | Medium |
| Form labels/errors | ⚠️ partial | Visible labels (not placeholder-only), `aria-live` errors, focus first invalid | Medium |
| Color-not-only | ⚠️ status via color | Pair every status with icon+text (badges mostly do ✅) | Medium |
| Screen-reader order | ❌ untested | Verify VoiceOver/TalkBack order + labels on key flows | Medium |

### 8. Dark mode readiness
Not built; **biggest single "premium" perception gap** for a fintech audience (Revolut/Stripe/Linear are dark-first for many users).
- **Prerequisite:** the **semantic theme layer** (§3.1) — replace raw `colors.*` imports with `theme.color.*`.
- **Then:** author a dark palette (desaturated surfaces `#0F1629→#151B2B` ladder, elevated surfaces lighten, text `#E7EAF0/#A6B0C0`, **keep semantic hues but tune brightness** — don't invert). Test contrast independently. Add a system/in-app toggle.
- **Effort:** L (tokenization is the real work; once done, dark is mostly palette). High strategic value, schedule as a **dedicated phase**.

### 8.1 Trust-building UI (the product's moat — push it further)
- **Escrow** always shown with **lock + "released only on delivery confirm"** (CLAUDE rule 2 ✅) — add the lock **stroke-draw** animation on hold.
- **Trust meter** on profiles; verified-facet checklist (phone ✓, ID ✓, flight ✓).
- **Live reassurance** in-transit ("Arjun is in the air — arrives ~6:40 PM", rule 6) with a calm animated indicator.
- **Open-box record** surfaced on traveller profiles as a trust artifact.
- **Money clarity:** every fee/threshold shown plainly with `numeric` figures (Stripe-grade transparency).

---

## 9. Prioritized implementation roadmap

### ⚡ Quick Wins (1–2 days total · high impact, low effort)
1. **Fix `skyBlue`-as-text contrast** → navy `#1E40AF` for links/labels. *(a11y + premium)* — S
2. **Tabular figures** for ₹/timers/ratings/counts. — S
3. **Add haptics** wrapper on 6 key moments (success/error/select/press). — S–M
4. **Strengthen card titles** to `titleM/600` + tighten meta. — S
5. **Add `accessibilityLabel` + hitSlop** to icon-only buttons. — M
6. **Tab bar unread badges** + stronger active state. — S–M
7. **Splash:** first-run-only full animation; cap blocking to ~1.3s. — S
8. **Official Google "G"** SVG on auth. — S

### 🛠 Medium Improvements (1–2 weeks · system-level, propagates)
9. **Skeleton/shimmer** component → replace list/detail spinners. — M
10. **Demote pastel → flat white cards + hairline + type hierarchy** (the premium lever). — M
11. **Semantic theme layer** (`theme.color.*`) replacing raw `colors.*`. — L (unlocks dark mode)
12. **Elevation ladder** enforced; hairline borders over shadows in lists. — M
13. **Forms upgrade:** sectioning, pinned CTA bar, inline validation, unified inputs. — M–L
14. **Toast** component for non-blocking success/error. — M
15. **UserProfile → trust dashboard** (meter, facets, reviews). — M
16. **Delivery Timeline → real vertical tracker** + in-transit indicator. — M–L
17. **Consistent stack/sheet transitions** + reduce-motion enforcement. — M

### 💎 Premium Features (phase work · flagship polish)
18. **Dark mode** (after theming layer). — L
19. **Surgical Lottie moments** (KYC ✓, escrow 🔒, delivery confetti). — M
20. **Shared-element transitions** list→detail. — M–L
21. **Celebratory success flows** (KYC/delivery/payout) with motion+haptics+copy. — M
22. **Live in-transit reassurance** with animated tracker. — M
23. **Accessibility pass** to WCAG AA (Dynamic Type, VoiceOver, focus order). — M–L

---

## 10. Highest visual impact ÷ least effort (do these first)

| Rank | Change | Impact | Effort | Why it wins |
|---|---|---|---|---|
| 1 | **Pastel → flat white cards + type hierarchy** | ★★★★★ | M | Single biggest "playful→premium" shift; propagates to all lists |
| 2 | **Skeleton shimmer** on lists | ★★★★☆ | M | Perceived speed; instantly reads "modern" (Linear/FB) |
| 3 | **Haptics** on key moments | ★★★★☆ | S | Disproportionate delight; trivial to add |
| 4 | **`skyBlue`→navy text** contrast fix | ★★★★☆ | S | Fixes a11y *and* looks more premium/serious |
| 5 | **Tabular numerals** for money | ★★★☆☆ | S | Stripe-grade money polish, no layout shift |
| 6 | **Card title weight/size** bump | ★★★★☆ | S | Hierarchy without adding color |
| 7 | **Tab badges + active polish** | ★★★☆☆ | S | Re-engagement + baseline premium cue |
| 8 | **Celebratory KYC/delivery success** | ★★★★☆ | M | Emotional peak moments → retention/referrals |

---

## 11. Guardrails (so the refresh stays coherent)
- **One card system, one elevation ladder, one icon weight per layer.**
- **Color = meaning.** If a color isn't gold(identity)/mint(money)/red(danger)/amber(pending)/primary(action), question it.
- **Type before color** for hierarchy.
- **Every animation:** transform/opacity only, ≤2 per view, reduce-motion fallback, exit < enter.
- **Every interactive element:** ≥44pt, pressed feedback <100ms, `accessibilityLabel`.
- **Test matrix before shipping any screen:** 375px width, largest Dynamic Type, reduce-motion on, (future) dark mode, VoiceOver pass.

---

*Audit produced with the ui-ux-pro-max (premium consumer-mobile) and minimalist-ui (editorial restraint) lenses. This is a design blueprint to be executed screen-by-screen after sign-off — no code or product behavior was changed in producing it.*
