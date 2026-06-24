# Design

Captured from the live design system: `src/theme/colors.ts`, `src/theme/index.ts`, the component library in `src/components/`, and the design constraints in the repo `CLAUDE.md`. This is a React Native (bare CLI 0.76.x) app using `StyleSheet` (not NativeWind) and TypeScript strict mode. Tokens are the single source of truth — never inline hex in components.

## Theme

Light, trust-first product UI. Surfaces are near-white neutrals (`#F5F6F8` app bg, `#FFFFFF` cards) so that the semantic trust colors do the talking. Deep navy (`#0F1629`) anchors headers and dark surfaces, giving an institutional, dependable frame. Sky blue is the single interactive accent. Gold, green, red, and amber are reserved strictly for meaning (identity, money, danger, transit) and never used decoratively. The overall feel is calm, accountable, and reassuring — closer to a bank's escrow flow than a social marketplace.

## Color

Semantic discipline is the core rule: each non-neutral hue owns one job.

### Brand
- `navyDark` `#0F1629` — app header, nav bar bg, primary dark backgrounds
- `navyMid` `#0F3460` — secondary surfaces, dark cards
- `skyBlue` `#4FA3E0` — primary CTA, active tab, links (the only interactive accent)
- `skyLight` `#E8F3FC` — blue tint backgrounds

### Gold — identity / flight trust ONLY (KYC, flight verified, ratings)
- `goldPrimary` `#E0931A` · `goldLight` `#FEF5E7` (badge bg tint) · `goldBorder` `#F5B93A`

### Green — money / escrow / delivery confirmed ONLY
- `mintPrimary` `#1DB574` · `mintLight` `#EAFAF3` (tint) · `mintBorder` `#5DD3A0`

### Semantic
- `dangerRed` `#E84040` · `dangerLight` `#FFF0F0` — disputes, prohibited items, destructive actions ONLY
- `cautionAmber` `#F5C800` · `cautionLight` `#FFFBF0` — in-transit / pending / warning ONLY

### Neutrals
- `bgApp` `#F5F6F8` · `bgCard` `#FFFFFF` · `bgSecondary` `#F0F2F5` (inputs)
- `borderLight` `#E0E3E9` (default 0.5px borders)
- `textPrimary` `#1C2330` · `textSecondary` `#5E6878` · `textHint` `#8E97A8`

### Gradients (react-native-linear-gradient)
- brand `#0F1629 → #16213E → #0F3460` (deep navy header)
- sky `#5BB0EC → #3E8BC9` (primary CTA) · gold `#F5B93A → #E0931A` (trust) · mint `#1DB574 → #0FA968` (money)

**Contrast rule:** body text ≥4.5:1, large/bold ≥3:1; placeholders and hints held to 4.5:1 — no light-gray-for-elegance. Semantic states always pair color with icon + label (color is never the only signal).

## Typography

Two families on a contrast axis: **Plus Jakarta Sans** (display/headings) + **Inter** (body/UI), both bundled as variable fonts (`src/assets/fonts`, mirrored into Android assets). Weight is driven by `fontWeight` mapped onto the wght axis. Falls back to system font until fonts load.

Scale (`typography` in `src/theme/index.ts`):
- `display` — 28 / 600 / -0.5 tracking — Plus Jakarta Sans
- `titleL` — 22 / 600 · `titleM` — 18 / 500 — Plus Jakarta Sans
- `bodyL` — 16 / 400 / 24 lh · `bodyM` — 14 / 400 / 21 lh — Inter
- `label` — 12 / 500 / +0.5 tracking · `caption` — 11 / 400 — Inter

## Layout & Spacing

- **Spacing scale:** `xs 4 · sm 8 · md 12 · lg 16 · xl 24 · 2xl 32 · 3xl 48`
- **Screen horizontal padding:** always 16px.
- **Radius:** chip 20 · button 10 · input 8 · card 12 · sheet 20 (top corners) · avatar 999
- **Component sizing:** primary button 52h (full width, radius 10) · secondary button 44h · input 48h (radius 8, 0.5px border) · tab bar 56h + safe area · avatar large 56 / small 32 · nav icon 22 · in-card icon 20
- **Navigation:** React Navigation v7 — stack + bottom tabs. Two 5-tab sets selected by role (Sender: Home, Find, Requests, Chat, Profile · Traveler: Trips, Requests, Earnings, Chat, Profile).

## Elevation & Shadow

- `elevation` levels: card 2 · sheet 8 · modal 16 · toast 12
- Layered shadow presets (`shadows.sm/md/lg`) use navy shadow color `#0F1629` at low opacity for soft, cool depth. iOS preset: opacity 0.07, radius 8, offset (0,2).

## Iconography

Phosphor Icons (outline weight only, 20–24px) via `phosphor-react-native` (+ `react-native-svg`). In-card icons 20px, nav tab icons 22px.

## Components

Existing library in `src/components/`: `Card`, `Screen` (screen scaffold), `ui.tsx` (buttons/primitives), `widgets.tsx`, `Icon`, `BrandMark`, `BrandLoader` (coin-flip brand loader), `AlertHost`, `Autocomplete`, `CountryCodePicker`, `DateField`, `PhotoButton`, `anim.tsx` (animation helpers).

### Trust badge system (most important component)
Pill, radius 20, padding 4px 10px, 0.5px border, anatomy `[icon 13px] [label 11px/500]`:
- **kycVerified / flightConfirmed** — goldLight bg, goldBorder, goldPrimary text
- **trustedCarrier** — skyLight bg, `#80BBED` border, `#185FA5` text
- **escrowHeld / delivered** — mintLight bg, mintBorder, `#096438` text
- **prohibited** — dangerLight bg, `#FF9090` border, `#921010` text
- **inTransit** — cautionLight bg, `#FFE066` border, cautionAmber text

Every traveler card must show avatar, name, rating (X.X ★ · N trips), and the badge stack. Escrow amount always shows a lock icon + "Released only on delivery confirm."

## Motion

`react-native-reanimated` v3. Every animation wrapped in `useReducedMotion()` with an instant-state fallback. Key motions: screen transition slide-right 280ms easeOut · KYC step complete scale 0.8→1 + fade 320ms spring · escrow lock stroke-draw 600ms · matching pulse opacity 0.4→1 loop 1.2s · in-transit plane translateX loop 3s · delivery success confetti + bounce 800ms · card press scale 1→0.97 100ms · toast slide translateY -80→0 220ms · bottom sheet translateY 100%→0 340ms spring. Ease-out curves, no bounce/elastic on UI transitions.
