/**
 * CarryMate mobile design system (see CLAUDE.md). StyleSheet-based.
 */
export { colors } from './colors';

/**
 * Type scale. fontFamily intentionally omitted until Plus Jakarta Sans + Inter
 * are bundled as RN assets; the sizes/weights/spacing match the spec and fall
 * back to the system font in the meantime.
 */
export const typography = {
  display: { fontSize: 28, fontWeight: '600' as const, letterSpacing: -0.5 },
  titleL: { fontSize: 22, fontWeight: '600' as const },
  titleM: { fontSize: 18, fontWeight: '500' as const },
  bodyL: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyM: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.5 },
  caption: { fontSize: 11, fontWeight: '400' as const },
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
  button: 10,
  input: 8,
  card: 12,
  sheet: 20,
  avatar: 999,
} as const;

export const elevation = {
  card: 2,
  sheet: 8,
  modal: 16,
  toast: 12,
} as const;

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

/** Brand gradients (use with react-native-linear-gradient). */
export const gradients = {
  brand: ['#0F1629', '#16213E', '#0F3460'], // deep navy header
  sky: ['#5BB0EC', '#3E8BC9'], // primary CTA
  gold: ['#F5B93A', '#E0931A'], // trust / verified
  mint: ['#1DB574', '#0FA968'], // money / escrow
} as const;
