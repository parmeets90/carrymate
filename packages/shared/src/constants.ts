/**
 * Business constants shared across the platform.
 * These mirror the hardcoded business rules in PLAN.md / the Technical PRD.
 * Enforce them at the API + DB layer, never UI-only.
 */

/** Platform commission as a fraction of the carry fee. */
export const COMMISSION_RATE = 0.15;

/** Current Terms/Privacy version users consent to at signup (DPDP). Bump on changes. */
export const CURRENT_TERMS_VERSION = '2026-06-24';

/**
 * Days to retain raw KYC ID images after a successful verification (DPDP data
 * minimization). The verification *status* + masked number are kept for audit;
 * only the underlying image file is purged after this window.
 */
export const KYC_IMAGE_RETENTION_DAYS = 180;

/** Carry fee bounds, in whole INR. */
export const MIN_CARRY_FEE_INR = 200;
export const MAX_CARRY_FEE_INR = 3000;

/** Package limits. */
export const MAX_PACKAGE_WEIGHT_KG = 5;
export const MIN_PACKAGE_WEIGHT_KG = 0.1;
export const MAX_DECLARED_VALUE_INR = 10000;

/** Marketplace throttles. */
export const MAX_ACTIVE_REQUESTS_PER_SENDER = 3;
export const MAX_ACTIVE_BIDS_PER_TRAVELER = 5;

/** Time windows (hours). */
export const DELIVERY_AUTO_CONFIRM_HOURS = 48;
export const DISPUTE_WINDOW_HOURS = 48;

/** A request must be posted at least this many days before its deadline. */
export const MIN_DEADLINE_DAYS = 3;

/** Unmatched requests auto-expire after this many days. */
export const REQUEST_EXPIRY_DAYS = 7;

/** Photos per request. */
export const MIN_REQUEST_PHOTOS = 1;
export const MAX_REQUEST_PHOTOS = 5;

/** Phase 1 corridor: India origin airports (IATA). */
export const INDIA_ORIGIN_AIRPORTS = [
  'DEL',
  'BOM',
  'BLR',
  'HYD',
  'MAA',
  'CCU',
  'COK',
  'AMD',
] as const;

/** Phase 1 corridor: UAE destination airports (IATA). */
export const UAE_DESTINATION_AIRPORTS = ['DXB', 'AUH', 'SHJ'] as const;

/** Phase 1 corridor: UAE destination cities. */
export const UAE_DESTINATION_CITIES = ['Dubai', 'Abu Dhabi', 'Sharjah'] as const;

/**
 * Prohibited-item keyword list. A request whose title/description matches any of
 * these is blocked at creation. This is the legal/compliance firewall.
 */
export const PROHIBITED_KEYWORDS = [
  'mobile',
  'phone',
  'smartphone',
  'iphone',
  'samsung',
  'laptop',
  'tablet',
  'ipad',
  'medicine',
  'tablet',
  'capsule',
  'injection',
  'pharma',
  'liquid',
  'alcohol',
  'perfume',
  'tobacco',
  'cigarette',
  'gun',
  'knife',
  'weapon',
  'currency',
  'cash',
  'gold',
  'bullion',
  'jewelry',
  'jewellery',
] as const;

/**
 * Context-aware prohibited-item rules (Challenge 08). Reduces false positives
 * over the flat keyword list: a trigger word only flags when the context fits.
 * - `amplifiers`: trigger + amplifier in the same text → flag (e.g. "samsung tablet").
 * - `safeCategories`: trigger flags only when the category is NOT safe (e.g. a
 *   "tablet" is fine in FOOD but suspicious elsewhere = medicine).
 * - neither: the trigger always flags (e.g. weapons, currency).
 */
export const PROHIBITED_CONTEXTS = {
  electronics: {
    triggers: ['tablet', 'phone', 'laptop', 'device', 'charger', 'cable', 'smartwatch', 'earbuds', 'headphone', 'camera', 'console', 'drone', 'router', 'powerbank'],
    amplifiers: ['android', 'samsung', 'apple', 'ipad', 'iphone', 'dell', 'hp', 'lenovo', 'macbook', 'oneplus', 'xiaomi', 'sony', 'bluetooth', 'wireless', 'gaming', 'electronic', 'smart'],
  },
  medicine: {
    triggers: ['capsule', 'syrup', 'medicine', 'drug', 'pill', 'injection', 'ointment', 'antibiotic', 'supplement', 'vitamin', 'tablet'],
    safeCategories: ['FOOD'],
  },
  liquids: {
    triggers: ['perfume', 'alcohol', 'aerosol', 'spray', 'liquor', 'wine'],
    safeCategories: ['FOOD'],
  },
  valuables: {
    triggers: ['gold', 'silver', 'jewelry', 'jewellery', 'cash', 'currency', 'bullion', 'diamond'],
  },
  weapons: {
    triggers: ['gun', 'knife', 'weapon', 'ammunition', 'blade', 'pistol', 'explosive'],
  },
} as const;

/** Legal declaration the sender must accept before posting a request (Challenge 08). */
export const ITEM_DECLARATIONS = [
  'My item is not electronics or electrical devices',
  'My item is not medicine, vitamins, or supplements',
  'My item is not liquids or aerosols',
  'My item is not worth more than ₹10,000',
  'I declare all information is accurate and truthful',
] as const;

/** Standard API error codes (extend per feature). */
export const ERROR_CODES = {
  NO_TOKEN: 'NO_TOKEN',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_BANNED: 'USER_BANNED',
  KYC_NOT_VERIFIED: 'KYC_NOT_VERIFIED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
