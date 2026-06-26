# CarryMate Design System v2 — "Warm Trustworthy Fintech Minimalism"

> The single source of truth for CarryMate's presentation layer. Every screen and component derives from these tokens. Direction: **minimal, elegant, editorial** — trust over decoration, type over color, whitespace over ornament. Benchmarks: Airbnb · Revolut · Uber · Linear · Apple HIG.
> Tokens live in `apps/mobile/src/theme/` (`colors.ts`, `index.ts`) and `apps/mobile/src/lib/haptics.ts`. **Never hardcode values in components — reference tokens.**

---

## 0. Principles
1. **Neutral-first.** Most surfaces are white/canvas. Color appears only to carry meaning.
2. **Type before color.** Hierarchy comes from size + weight + whitespace, not hue.
3. **Color = meaning.** Blue = action, gold = identity/trust, mint = money, red = danger, amber = pending. If a color isn't one of these, question it.
4. **Quiet motion.** Animation expresses cause→effect; ≤2 animated elements per view; always a reduced-motion fallback.
5. **One of everything.** One card system, one elevation ladder, one icon weight per layer.
6. **Accessible by default.** ≥4.5:1 text contrast, ≥44pt targets, labels on every control.

---

## 1. Color

### 1.1 Brand / action
| Token | Hex | Use |
|---|---|---|
| `primary` | `#1E40AF` | Primary CTA fill, links/labels on light (passes AA) |
| `primaryHover` / `primaryPressed` | `#1B398F` / `#16317A` | Pressed states |
| `primarySurface` | `#EAF1FE` | Tint behind primary content |
| `onPrimary` | `#FFFFFF` | Text/icon on primary |
| `link` | `#1E40AF` | Text links (replaces low-contrast `skyBlue` text) |

> **Migration note:** the legacy `skyBlue #4FA3E0` was used both as CTA fill *and* as text. As **text on white it fails AA (~2.4:1)** → use `primary`/`link`. As a large fill with white text it's acceptable but DS v2 prefers `primary` for a more trustworthy register.

### 1.2 Ink (text)
| Token | Hex | Use |
|---|---|---|
| `ink` | `#14181F` | Primary text |
| `inkSecondary` | `#5A6473` | Supporting text |
| `inkTertiary` | `#8A93A3` | Hints / disabled |

(Legacy `textPrimary/Secondary/Hint` remain as aliases during migration.)

### 1.3 Surfaces & structure
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F5F6F8` | App background |
| `surface` | `#FFFFFF` | Cards, sheets |
| `surfaceSunken` | `#F0F2F5` | Inputs, inset areas |
| `hairline` | `#ECEEF1` | Crisp 1px separators / flat-card borders |
| `borderLight` | `#E0E3E9` | Stronger structural border |

### 1.4 Semantic (meaning)
| Meaning | Fill / text | Surface (tint) |
|---|---|---|
| Money / success (mint) | `mintPrimary #1DB574` / `#096438` | `successSurface #EAFAF3` |
| Identity / trust (gold) | `goldPrimary #E0931A` | `goldSurface #FEF5E7` |
| Danger / destructive | `dangerRed #E84040` / `#921010` | `dangerSurface #FFF0F0` |
| Pending / in-transit | `warningText #9A6B00` | `warningSurface #FFF8E6` |

### 1.5 Pastel accents — **scarce**
`softBlue / softMint / softPeach / softLavender`. **Allowed:** a single hero/section wash, one status tint, the active/selected state. **Not allowed:** every list card, decorative tinting that lowers text contrast. (The current alternating-pastel list backgrounds are being removed in Phase 3.)

### 1.6 Dark mode (planned — Phase post-v2)
Author a parallel ramp (surfaces `#0F1629→#1C2333` lightening with elevation; text `#E7EAF0/#A6B0C0`; keep semantic hues, tune brightness — never invert). Requires the semantic-token migration first.

---

## 2. Typography
Pairing: **Plus Jakarta Sans** (display/headings) + **Inter** (body/UI). Variable fonts bundled.

| Role | Size / weight | Use |
|---|---|---|
| `display` | 28 / 600, ‑0.5 tracking | Screen hero titles |
| `titleL` | 22 / 600, ‑0.2 | Screen titles |
| `titleM` | 18 / 600 | **Card titles**, section heads |
| `bodyL` | 16 / 400, lh 24 | Primary body |
| `bodyM` | 14 / 400, lh 21 | Secondary body, meta |
| `label` | 12 / 500, +0.5 | Eyebrows, section labels (UPPERCASE) |
| `caption` | 11 / 400 | Fine print |
| `numeric` | 14 / 500, tabular | Money, counts, ratings |
| `numericLg` | 20 / 600, tabular | Headline amounts |

Rules: body line-height ≥1.5; measure ≤~60 chars; **tabular figures for all numbers** (₹, timers, ratings); min on-screen text 11 (prefer ≥12 for anything important); never pure black text.

---

## 3. Spacing & grid (4 / 8)
`xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48`.
Rhythm tiers: component `8/12` · intra-section `16` · inter-section `24/32` · screen top `24`. Screen horizontal padding `16` (hero screens may use `20/24`). Lists: 12 gap + safe-area insets so content never hides behind the tab bar.

---

## 4. Radius
`chip 20 (pills) · button 12 · input 12 · card 16 · cardLg 20 · sheet 20 · avatar 999`. Inputs and buttons share `12`. Large containers never exceed `20`.

---

## 5. Elevation & shadow (the ladder)
Components use `elevations.*` — **never** raw shadow objects. A screen uses **at most two** levels.
| Token | Use | Feel |
|---|---|---|
| `e0` | List rows (default) | Flat + hairline border, no shadow |
| `e1` | Resting cards | y3 · blur10 · opacity 0.05 (ultra-soft) |
| `e2` | Sheets, sticky CTA bars | y8 · blur20 · 0.08 |
| `e3` | Modals, dialogs, FAB | y16 · blur30 · 0.14 |
**Prefer hairline borders over shadows inside lists** (minimalist + perf).

---

## 6. Icons
Phosphor, via the `Icon` registry. **One weight per hierarchy:** `regular` inline/nav, `fill` for active/selected + trust badges. Sizes are tokens: `iconSize.sm 16 · md 20 · lg 24 · nav 22 · xl 28`. Every icon-only target: `accessibilityLabel` + ≥44pt hit area (`hitSlop`).

## 6.1 Illustration
Premium vector, duotone Phosphor motif on a soft pastel blob (`AuthIllustration`/`DecorBlobs`). Monochrome line-sketch + single offset pastel shape for empty states. No 3D, no cartoon, no stock photos.

---

## 7. Motion (`motion.*` tokens)
| Token | ms | Use |
|---|---|---|
| micro | 120 | press / toggle |
| fast | 180 | focus, small state |
| base | 240 | most transitions, sheet content |
| slow | 320 | screen reveals, milestones |
| deliberate | 600 | escrow lock draw, celebrations |
Easing: `easeOutQuint` enter; ease-in exit; **exit ≈70% of enter**. Springs (`motion.spring.tactile`) for sheets/cards. Stagger lists `motion.stagger` (≈48–55ms/item). Animate **transform/opacity only**. Gate everything on `useReducedMotion()`.

---

## 8. Haptics (`lib/haptics.ts`)
Call by meaning: `selection` (picker/OTP/tab) · `light` (press/toggle) · `success` (delivery/KYC/payout/escrow) · `warning` (dispute) · `error` (failed/validation). Phase 1 = built-in Vibration (Android); Phase 5 swaps to `react-native-haptic-feedback` for iOS Taptic. Use sparingly — confirmations and important actions only.

---

## 9. Component specs (implemented in Phase 2)

**Card** — `surface` bg, radius `card`, `e0` (hairline) by default / `e1` when raised; padding `lg`; title `titleM`, meta `bodyM/inkSecondary`. Pressable cards: scale 0.98 + `haptics.light`.

**Button** — Primary: `primary` fill, `onPrimary` text, height 52, radius 12, press scale 0.97. Secondary: `surface` + hairline, ink text, height 44. Tertiary/text: `link` label, no fill. Destructive: `dangerSurface` + danger text. One primary CTA per screen; disabled = 0.4 opacity, non-interactive.

**Input** — height 48, radius 12, `surfaceSunken` bg, hairline border → `primary` 1.5px focus ring; **always a visible label** + helper text; inline validation on blur; error text below field in danger. Same spec for autocomplete + date fields.

**Chip** — pill (radius `chip`), `label` type, small; selectable chips toggle `primarySurface`/`primary`. Use for tags, filters, quick-pick.

**Badge / TrustBadge** — pill, `[icon 13] [label 11/700]`, semantic tint+text per §1.4. TrustBadge variants fixed (kycVerified, flightConfirmed, escrowHeld, delivered, inTransit, prohibited, trustedCarrier).

**Status indicator** — semantic dot/pill + icon + text (never color alone).

**Timeline** — vertical tracker: hairline connector (only between nodes), node states (todo/active/done), state label + timestamp, animated in-transit node (pulse) gated on reduce-motion.

**Skeleton** — layout-shaped gray blocks with a shimmer sweep (reduce-motion → static). `Skeleton`, `SkeletonText`, `SkeletonCard`. Replaces list/detail spinners; coin `BrandLoader` only for app-boot + button-busy.

**Toast** — non-blocking, top or bottom, `e2`, auto-dismiss 3–5s, swipe-away, semantic leading icon; `aria-live` for SR. For success/error that don't need a decision.

**Bottom sheet** — slides from bottom, `e2`, scrim 50% black, grabber, swipe-down dismiss, confirm-on-dirty. Preferred over center dialogs for choices.

**Dialog (AlertHost)** — center modal `e3`, scrim 50%, title/body/actions; long labels stack vertically; destructive action uses danger styling and is separated.

**Empty state** — icon/illustration + title + body + **one action** (rule 10). 

**Error state** — cause + recovery action; near the field or as a toast.

**Success state** — brief celebratory confirmation (check/Lottie + `haptics.success` + "what's next") for KYC verified, escrow held, delivery confirmed, payout released.

---

## 10. Migration guardrails (Phases 2–5)
- Components read **only** from tokens (`colors.*` semantic, `typography.*`, `spacing.*`, `radius.*`, `elevations.*`, `iconSize.*`, `motion.*`, `haptics.*`).
- No logic / API / navigation / data changes — presentation only.
- After each phase: `tsc` typecheck must pass; no functional regression; build verified before proceeding.
- Per-screen ship check: 375px width · largest Dynamic Type · reduce-motion on · VoiceOver/TalkBack pass.

*DS v2 established Phase 1. Components migrate in Phase 2, screens adopt in Phase 3, polish in Phase 4, motion/haptics in Phase 5.*
