import {
  PROHIBITED_KEYWORDS,
  PROHIBITED_CONTEXTS,
  COMMISSION_RATE,
  INDIA_ORIGIN_AIRPORTS,
  UAE_DESTINATION_AIRPORTS,
  UAE_DESTINATION_CITIES,
} from '@carrymate/shared';
import { AppError } from './errors';

/** UAE airport (IATA) → destination city. */
export const AIRPORT_TO_CITY: Record<string, string> = {
  DXB: 'Dubai',
  AUH: 'Abu Dhabi',
  SHJ: 'Sharjah',
};

/** Return the first prohibited keyword found in the text, or null. */
export function findProhibitedKeyword(...parts: string[]): string | null {
  const haystack = parts.join(' ').toLowerCase();
  for (const word of PROHIBITED_KEYWORDS) {
    // word-boundary match to avoid false positives on substrings
    const re = new RegExp(`\\b${word.toLowerCase()}\\b`);
    if (re.test(haystack)) return word;
  }
  return null;
}

const wordIn = (haystack: string, word: string): boolean =>
  new RegExp(`\\b${word.toLowerCase()}\\b`).test(haystack);

export interface ProhibitedCheck {
  blocked: boolean;
  reason?: string; // context name, e.g. "electronics"
  matchedWord?: string;
}

/**
 * Context-aware prohibited-item check (Challenge 08). A trigger only blocks when
 * the context fits — so "tablet" passes in FOOD but "samsung tablet" is blocked.
 */
export function checkProhibited(
  title: string,
  description: string,
  category: string,
): ProhibitedCheck {
  const text = `${title} ${description}`.toLowerCase();

  for (const [reason, rules] of Object.entries(PROHIBITED_CONTEXTS)) {
    const trigger = rules.triggers.find((t) => wordIn(text, t));
    if (!trigger) continue;

    const amplifiers = 'amplifiers' in rules ? (rules.amplifiers as readonly string[]) : undefined;
    const safeCategories =
      'safeCategories' in rules ? (rules.safeCategories as readonly string[]) : undefined;

    if (amplifiers) {
      const amp = amplifiers.find((a) => wordIn(text, a));
      if (amp) return { blocked: true, reason, matchedWord: `${amp} ${trigger}` };
    } else if (safeCategories) {
      if (!safeCategories.includes(category)) return { blocked: true, reason, matchedWord: trigger };
    } else {
      return { blocked: true, reason, matchedWord: trigger };
    }
  }
  return { blocked: false };
}

/** Platform commission + traveler payout for a carry fee (whole INR). */
export function computeFees(carryFeeInr: number): { commissionInr: number; payoutInr: number } {
  const commissionInr = Math.round(carryFeeInr * COMMISSION_RATE);
  return { commissionInr, payoutInr: carryFeeInr - commissionInr };
}

/** Validate the Phase-1 corridor: India origin → UAE destination. */
export function assertCorridor(originAirport: string, destinationAirport: string): void {
  if (!(INDIA_ORIGIN_AIRPORTS as readonly string[]).includes(originAirport)) {
    throw new AppError(400, 'INVALID_AIRPORT', `Unsupported origin airport: ${originAirport}`);
  }
  if (!(UAE_DESTINATION_AIRPORTS as readonly string[]).includes(destinationAirport)) {
    throw new AppError(
      400,
      'DESTINATION_NOT_SUPPORTED',
      `Only UAE destinations are supported (${UAE_DESTINATION_AIRPORTS.join(', ')}).`,
    );
  }
}

/** Validate a UAE destination city. */
export function assertDestinationCity(city: string): void {
  if (!(UAE_DESTINATION_CITIES as readonly string[]).includes(city)) {
    throw new AppError(400, 'DESTINATION_NOT_SUPPORTED', `Unsupported destination city: ${city}`);
  }
}
