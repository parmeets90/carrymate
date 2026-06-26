/**
 * CarryMate mobile design system (see CLAUDE.md). StyleSheet-based.
 */
import { StyleSheet } from 'react-native';
import { colors } from './colors';
export { colors } from './colors';

/**
 * Soft pastel tints for list rows (UI refresh). Cycle by item index to give list
 * cards subtle, warm, alternating backgrounds — never for text or interactive fills.
 */
export const pastelTints = [colors.softBlue, colors.softMint, colors.softPeach, colors.softLavender] as const;
export const listTint = (index: number): string => pastelTints[index % pastelTints.length]!;

/**
 * Type scale. Plus Jakarta Sans (display/headings) + Inter (body/UI) are bundled
 * as variable fonts (apps/mobile/src/assets/fonts, mirrored into android assets).
 * Variable fonts expose a single family per typeface; weight is driven by
 * `fontWeight`, which Android maps onto the font's wght axis.
 */
export const fonts = {
  display: 'PlusJakartaSans',
  body: 'Inter',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.5 },
  titleL: { fontFamily: fonts.display, fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.2 },
  titleM: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600' as const },
  bodyL: { fontFamily: fonts.body, fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyM: { fontFamily: fonts.body, fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  label: { fontFamily: fonts.body, fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  caption: { fontFamily: fonts.body, fontSize: 11, fontWeight: '400' as const },
  // Tabular figures for money, timers, ratings, counts — no width shift (DS v2).
  numeric: { fontFamily: fonts.body, fontSize: 14, fontWeight: '500' as const, fontVariant: ['tabular-nums'] as ['tabular-nums'] },
  numericLg: { fontFamily: fonts.display, fontSize: 20, fontWeight: '600' as const, fontVariant: ['tabular-nums'] as ['tabular-nums'] },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  chip: 20,
  button: 12, // softened (UI refresh) — friendlier pill-ish buttons
  input: 12, // softened to match buttons/cards
  card: 16, // softened 12→16 for a warmer, more premium feel
  cardLg: 20, // hero / feature cards
  sheet: 20,
  avatar: 999,
} as const;

export const elevation = {
  card: 2,
  sheet: 8,
  modal: 16,
  toast: 12,
} as const;

/**
 * DS v2 elevation ladder — the canonical surface depth system. Components use
 * these (not raw `shadows`). Minimalist: ultra-soft, low-opacity; a screen uses
 * at most two levels. e0 = flat with a hairline border (preferred for list rows).
 */
export const elevations = {
  e0: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  e1: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  e2: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  e3: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

/** Border tokens — hairline = crisp 1px separators (minimalist default for lists). */
export const border = {
  hairline: { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.hairline },
  default: { borderWidth: 0.5, borderColor: colors.borderLight },
} as const;

/** Canonical icon sizes — use these tokens, never arbitrary values. */
export const iconSize = { sm: 16, md: 20, lg: 24, nav: 22, xl: 28 } as const;

/** Standard component sizes from the spec. */
export const sizing = {
  buttonPrimary: 52,
  buttonSecondary: 44,
  input: 48,
  tabBar: 56,
  avatarLarge: 56,
  avatarSmall: 32,
  iconTab: 22,
  iconCard: 20,
  screenPaddingX: 16,
} as const;

/** iOS shadow preset (pair with elevation on Android). */
export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

/** Layered shadow presets (cross-platform). */
export const shadows = {
  sm: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  lg: {
    shadowColor: '#0F1629',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
} as const;

/**
 * Motion vocabulary (CLAUDE.md Animation Spec). Durations in ms; easing names map
 * to RN `Easing` curves. Premium = ease-out, no bounce/elastic on UI transitions.
 * Every consumer must still honor `useReducedMotion()` with an instant fallback.
 */
export const motion = {
  duration: {
    micro: 100, // card / button press
    fast: 180, // toggles, focus, small state changes
    base: 240, // most transitions, sheets opening content
    slow: 320, // milestone pops, screen-level reveals
    deliberate: 600, // escrow lock stroke-draw, celebratory beats
  },
  // Cubic-bezier control points for ease-out-quint (premium decel curve).
  easeOutQuint: [0.22, 1, 0.36, 1] as const,
  // Springs tuned for tactile, settle-fast feel (no overshoot).
  spring: { tactile: { friction: 7, tension: 140 }, soft: { friction: 9, tension: 90 } },
  // Default per-item stagger for list entrances.
  stagger: 55,
} as const;

/** Brand gradients (use with react-native-linear-gradient). */
export const gradients = {
  brand: ['#0F1629', '#16213E', '#0F3460'], // deep navy header
  sky: ['#5BB0EC', '#3E8BC9'], // primary CTA
  gold: ['#F5B93A', '#E0931A'], // trust / verified
  mint: ['#1DB574', '#0FA968'], // money / escrow
} as const;
