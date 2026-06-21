/**
 * CarryMate mobile design tokens. Single source of truth for colors,
 * spacing, radii, and typography. Build all screens from these.
 */
export const colors = {
  navy: '#1a1a2e',
  navySoft: '#16213e',
  primary: '#e94560', // action / brand accent
  primaryDark: '#c5364d',
  highlight: '#f5a623',
  background: '#ffffff',
  surface: '#f8f9fc',
  border: '#e2e8f0',
  text: '#1e293b',
  textMuted: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  white: '#ffffff',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, color: colors.navy },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.navy },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  muted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  button: { fontSize: 16, fontWeight: '700' as const, color: colors.white },
} as const;
