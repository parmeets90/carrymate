import { Vibration, Platform } from 'react-native';

/**
 * Semantic haptics (DS v2). Call by *meaning*, not by pattern, so we can swap the
 * engine later without touching call sites.
 *
 * Phase 1: a safe, dependency-free implementation using the built-in `Vibration`
 * API. Android gives real feedback now (Pixel); iOS is intentionally a no-op for
 * the subtle cues (raw Vibration there is too blunt). Phase 5 will swap this for
 * `react-native-haptic-feedback` to get proper iOS Taptic + Android richer
 * effects — only this file changes.
 *
 * Usage guideline:
 *  - selection : picker tick, OTP digit, tab switch
 *  - light     : card/button press, toggle
 *  - success   : delivery confirmed, KYC verified, payout released, escrow held
 *  - warning   : dispute opened, item needs review
 *  - error     : failed payment, validation error, rejected action
 */
const isAndroid = Platform.OS === 'android';

function buzz(pattern: number | number[]): void {
  // Vibration patterns need the Android VIBRATE permission (declared in manifest).
  if (isAndroid) Vibration.vibrate(pattern);
}

export const haptics = {
  selection: () => buzz(6),
  light: () => buzz(10),
  success: () => buzz([0, 24, 36, 24]),
  warning: () => buzz([0, 18, 60, 18]),
  error: () => buzz([0, 36, 28, 36]),
} as const;

export type HapticKind = keyof typeof haptics;
