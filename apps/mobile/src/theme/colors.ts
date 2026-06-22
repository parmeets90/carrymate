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
} as const;
