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
