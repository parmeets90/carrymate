/**
 * CarryMate color tokens — single source of truth (see CLAUDE.md).
 * NEVER use hex values inline in components — always reference colors.*
 * - Gold  → identity/trust badges only (KYC, flight verified, ratings)
 * - Green → money/escrow/delivery confirmed only
 * - Red   → disputes, prohibited items, destructive actions only
 * - Amber → in-transit / pending / warning only
 */
export const colors = {
  // Brand
  navyDark: '#0F1629', // app header, nav bar bg, primary dark bg
  navyMid: '#0F3460', // secondary surfaces, dark cards
  skyBlue: '#4FA3E0', // primary CTA, active tab, links
  skyLight: '#E8F3FC', // blue tint backgrounds

  // Trust signals (Gold = identity/flight trust)
  goldPrimary: '#E0931A',
  goldLight: '#FEF5E7',
  goldBorder: '#F5B93A',

  // Money / success states (Green = escrow / delivery)
  mintPrimary: '#1DB574',
  mintLight: '#EAFAF3',
  mintBorder: '#5DD3A0',

  // Semantic
  dangerRed: '#E84040',
  dangerLight: '#FFF0F0',
  cautionAmber: '#F5C800',
  cautionLight: '#FFFBF0',

  // Neutrals
  bgApp: '#F5F6F8',
  bgCard: '#FFFFFF',
  bgSecondary: '#F0F2F5',
  borderLight: '#E0E3E9',
  textPrimary: '#1C2330',
  textSecondary: '#5E6878',
  textHint: '#8E97A8',
  white: '#FFFFFF',

  // Pastel accents — DECORATIVE ONLY (soft blobs/surfaces, never text or CTAs).
  // Very low saturation so they read as warmth, not colour. (UI refresh 2026-06.)
  softBlue: '#EAF1FE',
  softMint: '#E7F7F1',
  softPeach: '#FDEFE6',
  softLavender: '#F0ECFB',

  // ────────────────────────────────────────────────────────────────────────
  // Design System v2 — "Warm Trustworthy Fintech Minimalism" (2026-06).
  // Neutral-first, ink-based text, deep-blue primary. Color = meaning only.
  // ADDITIVE: existing keys above are kept for back-compat; components migrate
  // to these semantic tokens in Phase 2. See docs/DESIGN_SYSTEM.md.
  // ────────────────────────────────────────────────────────────────────────

  // Brand / primary action — deep, trustworthy blue (Revolut/Stripe register).
  primary: '#1E40AF', // primary CTA fill + links/labels on light (passes AA)
  primaryHover: '#1B398F',
  primaryPressed: '#16317A',
  primarySurface: '#EAF1FE', // tint behind primary content (= softBlue)
  onPrimary: '#FFFFFF',
  link: '#1E40AF', // text links on light surfaces (replaces low-contrast skyBlue text)

  // Ink scale (text) — warm near-black, not pure black.
  ink: '#14181F', // primary text
  inkSecondary: '#5A6473', // supporting text
  inkTertiary: '#8A93A3', // hints / disabled

  // Surfaces & structure.
  canvas: '#F5F6F8', // app background (= bgApp)
  surface: '#FFFFFF', // cards / sheets
  surfaceSunken: '#F0F2F5', // inputs / inset areas (= bgSecondary)
  hairline: '#ECEEF1', // crisp 1px separators (lighter than borderLight)

  // Semantic surfaces (tint + accessible text already exist as *Light/*Primary).
  successSurface: '#EAFAF3',
  goldSurface: '#FEF5E7',
  dangerSurface: '#FFF0F0',
  warningSurface: '#FFF8E6', // softer than cautionLight for a calmer pending state
  warningText: '#9A6B00', // accessible amber text (AA on warningSurface)
} as const;
