import ImageLabeling from '@react-native-ml-kit/image-labeling';
import type { ActiveScanRule } from '@carrymate/shared';

/**
 * On-device AI "Smart Scan" for the Open-Box flow. Runs Google ML Kit image
 * labeling (free, offline, on-device — the photo never leaves the phone) and
 * flags visually-identifiable prohibited categories.
 *
 * IMPORTANT: this is a probabilistic aid layered on the manual checklist + the
 * server-side prohibited-keyword screening — NOT a guarantee, and it cannot see
 * inside packaging. It catches common prohibited objects in an *open* package.
 */
export interface ScanVerdict {
  ok: boolean; // true when nothing prohibited was detected
  reason?: string; // prohibited category, e.g. "electronics"
  message?: string; // user-facing explanation
  matchedLabel?: string; // the label that triggered the flag
  labels: string[]; // top labels (transparency)
}

// ML Kit base-model label (lowercased substring) → prohibited category.
// These ship as a built-in fallback; the live list is managed by admins and
// pulled from GET /v1/scan-rules (see setScanRules below).
const DEFAULT_PROHIBITED: { match: string; reason: string }[] = [
  // Electronics — includes the generic labels the base ML Kit model emits for
  // a laptop/phone/TV (it often returns "Technology"/"Output device" instead of
  // the specific object name).
  { match: 'mobile phone', reason: 'electronics' },
  { match: 'telephone', reason: 'electronics' },
  { match: 'smartphone', reason: 'electronics' },
  { match: 'phone', reason: 'electronics' },
  { match: 'tablet', reason: 'electronics' },
  { match: 'laptop', reason: 'electronics' },
  { match: 'netbook', reason: 'electronics' },
  { match: 'computer', reason: 'electronics' },
  { match: 'touchpad', reason: 'electronics' },
  { match: 'keyboard', reason: 'electronics' },
  { match: 'monitor', reason: 'electronics' },
  { match: 'output device', reason: 'electronics' },
  { match: 'display', reason: 'electronics' },
  { match: 'screen', reason: 'electronics' },
  { match: 'camera', reason: 'electronics' },
  { match: 'television', reason: 'electronics' },
  { match: 'headphones', reason: 'electronics' },
  { match: 'gadget', reason: 'electronics' },
  { match: 'technology', reason: 'electronics' },
  { match: 'electronic', reason: 'electronics' },
  // Liquids / alcohol
  { match: 'bottle', reason: 'liquids' },
  { match: 'perfume', reason: 'liquids' },
  { match: 'liquor', reason: 'liquids' },
  { match: 'wine', reason: 'liquids' },
  { match: 'beer', reason: 'liquids' },
  { match: 'cocktail', reason: 'liquids' },
  // Valuables
  { match: 'jewellery', reason: 'valuables' },
  { match: 'jewelry', reason: 'valuables' },
  { match: 'gold', reason: 'valuables' },
  { match: 'coin', reason: 'valuables' },
  { match: 'cash', reason: 'valuables' },
  { match: 'watch', reason: 'valuables' },
  { match: 'ring', reason: 'valuables' },
  // Weapons
  { match: 'knife', reason: 'weapons' },
  { match: 'gun', reason: 'weapons' },
  { match: 'weapon', reason: 'weapons' },
  { match: 'sword', reason: 'weapons' },
  { match: 'dagger', reason: 'weapons' },
  // Medicine
  { match: 'pill', reason: 'medicine' },
  { match: 'medicine', reason: 'medicine' },
  { match: 'capsule', reason: 'medicine' },
  { match: 'syringe', reason: 'medicine' },
];

// Live admin-managed rules, hydrated at runtime via setScanRules(). Until then
// (offline / first launch) the built-in DEFAULT_PROHIBITED list is used.
let prohibitedRules: { match: string; reason: string }[] = DEFAULT_PROHIBITED;
let allowedLabels: string[] = [];

/**
 * Replace the active scan ruleset with the admin-managed list pulled from the
 * API. Prohibited rules flag a match; allowed rules whitelist a label so it is
 * never flagged (an admin escape hatch for benign look-alikes). Passing an empty
 * or undefined list falls back to the built-in defaults so the scan still works.
 */
export function setScanRules(rules: ActiveScanRule[] | undefined): void {
  if (!rules || rules.length === 0) {
    prohibitedRules = DEFAULT_PROHIBITED;
    allowedLabels = [];
    return;
  }
  prohibitedRules = rules
    .filter((r) => r.kind === 'PROHIBITED')
    .map((r) => ({ match: r.label.toLowerCase(), reason: (r.category ?? 'prohibited').toLowerCase() }));
  allowedLabels = rules
    .filter((r) => r.kind === 'ALLOWED')
    .map((r) => r.label.toLowerCase());
  // Guard against an admin clearing every prohibited rule — keep defaults then.
  if (prohibitedRules.length === 0) prohibitedRules = DEFAULT_PROHIBITED;
}

const REASON_COPY: Record<string, string> = {
  electronics: 'This looks like an electronic device — electronics aren’t allowed. Don’t accept if the contents are electronic.',
  liquids: 'This looks like a bottle or liquid — liquids, alcohol and perfume aren’t allowed.',
  valuables: 'This looks like jewellery or valuables — high-value goods aren’t allowed.',
  weapons: 'This looks like a weapon — strictly prohibited. Reject immediately.',
  medicine: 'This looks like medicine — medicines and supplements aren’t allowed.',
};

const MIN_CONFIDENCE = 0.5;

// Concrete declared categories we can sanity-check a photo against (catch-alls
// like GIFTS/OTHER are too broad to flag a mismatch reliably).
const CATEGORY_LABELS: Record<string, string[]> = {
  FOOD: ['food', 'fruit', 'vegetable', 'snack', 'dish', 'meal', 'dessert', 'produce', 'baked', 'sweetness', 'cuisine'],
  DOCUMENTS: ['paper', 'document', 'book', 'envelope', 'text', 'letter', 'newspaper', 'handwriting'],
  CLOTHING: ['clothing', 'textile', 'shirt', 'dress', 'footwear', 'shoe', 'jacket', 'outerwear', 'fashion', 'jeans', 'sleeve'],
};

function inferCategory(lowerLabels: string[]): string | null {
  for (const [cat, keys] of Object.entries(CATEGORY_LABELS)) {
    if (lowerLabels.some((t) => keys.some((k) => t.includes(k)))) return cat;
  }
  return null;
}

/**
 * Scan a local image URI; returns a verdict. Never throws (ML errors → inconclusive).
 * Pass the declared category to also flag a category mismatch.
 */
export async function smartScanImage(uri: string, declaredCategory?: string): Promise<ScanVerdict> {
  try {
    const result = await ImageLabeling.label(uri);
    const labels = result.filter((l) => l.confidence >= MIN_CONFIDENCE);
    const labelTexts = labels.map((l) => l.text);
    const lowers = labelTexts.map((t) => t.toLowerCase());
    const declared = declaredCategory?.toUpperCase();
    const declaredCtx = declaredCategory ? `You declared ${declaredCategory.toLowerCase()}, but ` : '';

    // 1. Prohibited object (highest priority). Skip anything an admin whitelisted.
    for (const l of labels) {
      const lower = l.text.toLowerCase();
      if (allowedLabels.some((a) => lower.includes(a))) continue;
      const hit = prohibitedRules.find((p) => lower.includes(p.match));
      if (hit) {
        const copy =
          REASON_COPY[hit.reason] ??
          `This looks like a prohibited item (${hit.reason}). Don’t accept it.`;
        return { ok: false, reason: hit.reason, message: declaredCtx + copy, matchedLabel: l.text, labels: labelTexts };
      }
    }

    // 2. Category mismatch — only for concrete declared categories.
    if (declared && CATEGORY_LABELS[declared]) {
      const inferred = inferCategory(lowers);
      if (inferred && inferred !== declared) {
        return {
          ok: false,
          reason: 'mismatch',
          message: `You declared ${declaredCategory!.toLowerCase()}, but this photo looks like ${inferred.toLowerCase()}. Make sure the contents match the declaration.`,
          labels: labelTexts,
        };
      }
    }

    return { ok: true, labels: labelTexts };
  } catch {
    // Inconclusive (model unavailable / bad image) — never block on this.
    return { ok: true, labels: [] };
  }
}
