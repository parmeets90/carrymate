import ImageLabeling from '@react-native-ml-kit/image-labeling';

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
const PROHIBITED: { match: string; reason: string }[] = [
  // Electronics
  { match: 'mobile phone', reason: 'electronics' },
  { match: 'telephone', reason: 'electronics' },
  { match: 'smartphone', reason: 'electronics' },
  { match: 'tablet computer', reason: 'electronics' },
  { match: 'laptop', reason: 'electronics' },
  { match: 'computer', reason: 'electronics' },
  { match: 'camera', reason: 'electronics' },
  { match: 'television', reason: 'electronics' },
  { match: 'headphones', reason: 'electronics' },
  { match: 'gadget', reason: 'electronics' },
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

    // 1. Prohibited object (highest priority).
    for (const l of labels) {
      const lower = l.text.toLowerCase();
      const hit = PROHIBITED.find((p) => lower.includes(p.match));
      if (hit) {
        return { ok: false, reason: hit.reason, message: declaredCtx + REASON_COPY[hit.reason], matchedLabel: l.text, labels: labelTexts };
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
