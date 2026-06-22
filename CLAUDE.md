# CarryMate — Design System & UI Constraints
# Paste this at the start of every Claude Code session for this project.

You are building CarryMate, a peer-to-peer cross-border luggage marketplace (India → UAE).
This is a TRUST-FIRST, mobile-native product built in React Native (Expo).
Every UI decision must reinforce safety, legitimacy, and accountability.

---

## STACK
- React Native (Expo SDK, latest stable)
- TypeScript strict mode
- NativeWind (Tailwind for RN) OR StyleSheet — pick one and stay consistent
- React Navigation v6 (stack + bottom tabs)
- Phosphor Icons (outline weight only, 20–24px)
- Razorpay for payments (INR only in MVP)

---

## COLOR TOKENS
Define these as a constants file at `src/theme/colors.ts`:

```ts
export const colors = {
  // Brand
  navyDark:    '#0F1629',   // app header, nav bar bg, primary dark bg
  navyMid:     '#0F3460',   // secondary surfaces, dark cards
  skyBlue:     '#4FA3E0',   // primary CTA, active tab, links
  skyLight:    '#E8F3FC',   // blue tint backgrounds

  // Trust signals (Gold = identity/flight trust)
  goldPrimary: '#E0931A',   // KYC badge, flight confirmed badge, star ratings
  goldLight:   '#FEF5E7',   // gold badge background tint
  goldBorder:  '#F5B93A',   // gold badge border

  // Money / success states (Green = escrow / delivery)
  mintPrimary: '#1DB574',   // escrow locked, delivered, success
  mintLight:   '#EAFAF3',   // green tint background
  mintBorder:  '#5DD3A0',   // green border

  // Semantic
  dangerRed:   '#E84040',   // disputes, prohibited items, errors
  dangerLight: '#FFF0F0',   // red tint bg
  cautionAmber:'#F5C800',   // in-transit, pending states
  cautionLight:'#FFFBF0',   // amber tint bg

  // Neutrals
  bgApp:       '#F5F6F8',   // screen background
  bgCard:      '#FFFFFF',   // card surface
  bgSecondary: '#F0F2F5',   // input backgrounds, secondary surfaces
  borderLight: '#E0E3E9',   // default borders (0.5px)
  textPrimary: '#1C2330',   // main text
  textSecondary:'#5E6878',  // supporting text, labels
  textHint:    '#8E97A8',   // placeholder, disabled
  white:       '#FFFFFF',
} as const;
```

RULES:
- NEVER use hex values inline in components — always reference `colors.*`
- Gold ONLY for identity/trust badges (KYC, flight verified, ratings)
- Green ONLY for money/escrow/delivery confirmed states
- Red ONLY for disputes, prohibited items, destructive actions
- Amber ONLY for in-transit / pending / warning states

---

## TYPOGRAPHY
Font family: `Plus Jakarta Sans` for headings/display, `Inter` for body/UI.
Load both via expo-font.

Scale (in StyleSheet sp values):
```ts
export const typography = {
  display:  { fontSize: 28, fontWeight: '600', letterSpacing: -0.5, fontFamily: 'PlusJakartaSans-SemiBold' },
  titleL:   { fontSize: 22, fontWeight: '600', fontFamily: 'PlusJakartaSans-SemiBold' },
  titleM:   { fontSize: 18, fontWeight: '500', fontFamily: 'PlusJakartaSans-Medium' },
  bodyL:    { fontSize: 16, fontWeight: '400', lineHeight: 24, fontFamily: 'Inter-Regular' },
  bodyM:    { fontSize: 14, fontWeight: '400', lineHeight: 21, fontFamily: 'Inter-Regular' },
  label:    { fontSize: 12, fontWeight: '500', letterSpacing: 0.5, fontFamily: 'Inter-Medium' },
  caption:  { fontSize: 11, fontWeight: '400', fontFamily: 'Inter-Regular' },
} as const;
```

---

## SPACING & RADIUS
```ts
export const spacing = { xs:4, sm:8, md:12, lg:16, xl:24, '2xl':32, '3xl':48 } as const;

export const radius = {
  chip:   20,   // badges, pills
  button: 10,
  input:  8,
  card:   12,
  sheet:  20,   // bottom sheets — top corners only
  avatar: 999,  // circle
} as const;
```

Screen horizontal padding: always 16px.

---

## ELEVATION (React Native)
```ts
export const elevation = {
  card:   2,
  sheet:  8,
  modal:  16,
  toast:  12,
} as const;
// iOS shadow: { shadowColor:'#000', shadowOpacity:0.07, shadowRadius:8, shadowOffset:{width:0,height:2} }
```

---

## COMPONENT SIZING
- Primary button:  height 52px, full width, borderRadius 10
- Secondary button: height 44px
- Input field:     height 48px, borderRadius 8, borderWidth 0.5
- Tab bar:         height 56px + safe area inset
- Avatar large:    56px circle
- Avatar small:    32px circle
- Icon (nav tab):  22px
- Icon (in-card):  20px

---

## TRUST BADGE SYSTEM
This is the single most important visual element. Use these exact badge variants:

```ts
// Badge types and their colors
const badges = {
  kycVerified:      { bg: colors.goldLight,  border: colors.goldBorder, text: colors.goldPrimary, label: 'KYC verified',      icon: 'IdentificationCard' },
  flightConfirmed:  { bg: colors.goldLight,  border: colors.goldBorder, text: colors.goldPrimary, label: 'Flight confirmed',   icon: 'AirplaneTakeoff' },
  trustedCarrier:   { bg: colors.skyLight,   border: '#80BBED',         text: '#185FA5',           label: 'Trusted carrier',   icon: 'SealCheck' },
  escrowHeld:       { bg: colors.mintLight,  border: colors.mintBorder, text: '#096438',           label: 'Escrow secured',    icon: 'Lock' },
  delivered:        { bg: colors.mintLight,  border: colors.mintBorder, text: '#096438',           label: 'Delivered',         icon: 'CheckCircle' },
  prohibited:       { bg: colors.dangerLight,border: '#FF9090',         text: '#921010',           label: 'Prohibited item',   icon: 'ProhibitInset' },
  inTransit:        { bg: colors.cautionLight,border:'#FFE066',         text: colors.cautionAmber, label: 'In transit',        icon: 'AirplaneTilt' },
}
```

Badge anatomy: `[icon 13px] [label text 11px 500]` — pill shape, radius 20, padding 4px 10px, border 0.5px.

---

## NAVIGATION STRUCTURE

### Sender tab bar (5 tabs):
1. Home (`House` icon) — route listings, recent activity
2. Find (`MagnifyingGlass`) — search travelers by route/date
3. Requests (`Package`) — my active & past requests
4. Chat (`ChatCircle`) — in-app messaging
5. Profile (`UserCircle`) — KYC status, settings

### Traveler tab bar (5 tabs):
1. Trips (`AirplaneTakeoff`) — my flights + open requests on those routes
2. Requests (`Package`) — requests I've accepted
3. Earnings (`Wallet`) — payouts, history
4. Chat (`ChatCircle`)
5. Profile (`UserCircle`)

App detects role (sender/traveler) and renders the correct tab set. Users can switch role in Profile.

---

## SCREEN ARCHITECTURE (build in this order)
1. Onboarding + OTP auth (phone number, MSG91)
2. KYC flow: Aadhaar/PAN → passport scan → selfie → IDFY webhook
3. Sender home: route cards (DEL→DXB with traveler count + date)
4. Post request form: item type, weight, deadline, photo
5. Match list: traveler cards with full badge stack
6. Traveler profile: trust meter, trip history, open-box record
7. Escrow payment sheet: breakdown + Razorpay integration
8. Open-box declaration: camera capture, item checklist, sign-off
9. Delivery tracker: 4-step timeline (matched → declared → in-transit → delivered)
10. Confirm delivery + photo proof upload
11. Rating screen (bidirectional)
12. Dispute flow: evidence upload, admin escalation
13. Traveler home: active flight card + pending requests
14. Earnings screen: payout history, bank account link
15. Admin dashboard (separate web app — out of scope for mobile)

---

## ANIMATION SPEC
Use `react-native-reanimated` v3 for all animations.

| Name | Spec | Trigger |
|---|---|---|
| Screen transition | slide-right, 280ms, easeOut | All navigations |
| KYC step complete | scale 0.8→1 + fade, 320ms, spring | Each verify milestone |
| Escrow lock | lock icon stroke-draw, 600ms, linear | Payment confirmed |
| Matching pulse | opacity 0.4→1 loop, 1.2s, easeInOut | Finding a traveler |
| In-transit plane | translateX 0→100% loop, 3s, linear | Tracking screen |
| Delivery success | confetti + scale bounce, 800ms | Confirmed delivered |
| Card press | scale 1→0.97, 100ms, easeOut | All Pressable cards |
| Toast slide | translateY -80→0 + fade, 220ms, easeOut | Alerts, match found |
| Bottom sheet | translateY 100%→0, 340ms, spring | Payment, item detail |

Always wrap animations in `useReducedMotion()` check — fall back to instant state change.

---

## KEY UX RULES (never violate these)
1. KYC is MANDATORY before any transaction — never skip or mock it
2. Escrow amount must ALWAYS be shown with a lock icon + "Released only on delivery confirm" subtext
3. Open-box declaration is required before traveler accepts ANY item — no exceptions
4. Prohibited items list must be checked at request creation, not at match time
5. Every traveler card must show: avatar, name, rating (X.X ★ · N trips), and badge stack
6. The in-transit state MUST show reassurance copy to sender ("Arjun is in the air…")
7. Dispute CTA must be reachable within 2 taps from any active request screen
8. Chat is masked — never show real phone numbers in the UI
9. All currency is INR (₹) only in MVP — no other currency symbols
10. Empty states must include a clear action (not just "nothing here")

---

## WHAT NOT TO BUILD (MVP out of scope)
- Electronics, medicines, liquids in item categories
- GPS real-time tracking
- Insurance claim flow (show "coming soon" badge only)
- Canada / USA routes (use feature flag `ENABLE_CANADA=false`)
- Traveler leaderboard / ranking
- Multi-currency
- Corporate gifting
- AI fraud detection (use rules-based only)
- In-app signature capture

If asked to build any of the above: respond "This is explicitly out of scope for MVP — flagging for V2."

---

## FILE STRUCTURE