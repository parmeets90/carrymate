/**
 * In-app legal content (user-facing). Derived from docs/legal/TERMS_OF_SERVICE.md
 * and docs/legal/PRIVACY_POLICY.md, trimmed for the app. Keep this in sync with the
 * canonical docs; counsel finalises wording before public launch.
 */
export const LEGAL_VERSION = '2026-06-24'; // matches the consent version recorded at signup
export const SUPPORT_EMAIL = 'support@carrymate.in'; // TODO(founder): set the real support address

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS: LegalDoc = {
  title: 'Terms of Service',
  updated: LEGAL_VERSION,
  intro:
    'These terms govern your use of CarryMate. By creating an account and continuing, you agree to them and to our Privacy Policy.',
  sections: [
    {
      heading: 'What CarryMate is',
      paragraphs: [
        'CarryMate is a technology marketplace that connects people sending personal items (Senders) with verified air travellers who have spare baggage space (Travellers). We provide identity verification, in-app messaging, an escrow-style payment hold, and dispute tools.',
        'CarryMate is not a courier, freight forwarder, shipping company, customs broker, or bank. The carriage arrangement is directly between the Sender and the Traveller.',
      ],
    },
    {
      heading: 'Eligibility & verification',
      paragraphs: [
        'You must be at least 18 and able to enter contracts. Identity verification (KYC) is mandatory before you can transact. You agree to provide accurate information and not to impersonate anyone or use another person’s documents.',
      ],
    },
    {
      heading: 'Sender responsibilities',
      bullets: [
        'You own, or are authorised to send, the item.',
        'The item is accurately described and is not a prohibited item.',
        'It complies with the export laws of the origin and import laws of the destination.',
        'You truthfully complete the item declaration; the declared value is accurate and within our caps.',
      ],
    },
    {
      heading: 'Traveller responsibilities',
      paragraphs: [
        'You carry items voluntarily and are solely responsible for everything in your baggage. Inspect every item using the in-app Open-Box Declaration before you accept it — never carry a sealed item you have not inspected.',
        'You are the importer of record. You are solely responsible for making truthful customs declarations and for paying any duties or taxes at the destination. You must follow all airline and aviation-security rules. If you are unsure whether an item is permissible, do not carry it.',
      ],
    },
    {
      heading: 'Prohibited & restricted items',
      paragraphs: [
        'Electronics for resale, medicines/drugs, liquids/alcohol/perfume, weapons, currency or valuables above declared limits, restricted food, counterfeit goods, and anything illegal to export or import may not be sent or carried. Screening at posting is an aid, not a guarantee — Senders and Travellers remain responsible.',
      ],
    },
    {
      heading: 'Payments, escrow & fees',
      paragraphs: [
        'When a Sender accepts a bid, the carry fee is held by our licensed payment partner and released to the Traveller only after delivery is confirmed (or after the auto-confirm window). CarryMate charges a platform commission, shown before you confirm. Refunds for cancellations and dispute outcomes are handled per the dispute process. All amounts are in Indian Rupees (₹) during the pilot.',
      ],
    },
    {
      heading: 'Stay on the platform',
      paragraphs: [
        'Keep communication and payment on CarryMate. Sharing phone numbers, emails, or payment handles to deal off-platform is prohibited and voids platform protections; our chat masks such details to protect both parties.',
      ],
    },
    {
      heading: 'Disputes & ratings',
      paragraphs: [
        'If something goes wrong, raise a dispute in-app within the stated window. Funds are frozen, both parties submit evidence, and we decide an outcome in good faith (refund, release, or split). After completion, both parties may leave honest ratings.',
      ],
    },
    {
      heading: 'Insurance',
      paragraphs: ['Item insurance is not currently offered (coming soon). Until then, items are carried at the owner’s risk, subject to the dispute remedies above.'],
    },
    {
      heading: 'Disclaimers & liability',
      paragraphs: [
        'The platform is provided “as is”. We do not guarantee the conduct of any user, the condition or legality of any item, customs outcomes, or delivery. To the maximum extent permitted by law, our liability is limited, and we are not liable for customs duties, penalties, seizures, or losses arising from items sent or carried. You agree to indemnify CarryMate for claims arising from your use, the items you send or carry, and your customs declarations.',
      ],
    },
    {
      heading: 'Suspension, changes & contact',
      paragraphs: [
        'We may suspend or terminate accounts for breach, fraud signals, or legal reasons. You can delete your account anytime in Profile → Privacy & data, subject to completing active transactions. We may update these terms; continued use means acceptance.',
        `Questions: ${SUPPORT_EMAIL}.`,
      ],
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  updated: LEGAL_VERSION,
  intro:
    'This policy explains what personal data we collect, why, who we share it with, and the rights you have under India’s Digital Personal Data Protection Act (DPDP). By using CarryMate you consent to this processing.',
  sections: [
    {
      heading: 'Data we collect',
      bullets: [
        'Account & contact: phone, email, name, role, language.',
        'Identity (KYC): government ID, ID number, selfie/liveness, verification result.',
        'Transactions: requests, trips, bids, orders, fees, payout/bank details.',
        'Items & delivery: descriptions, photos, recipient details, open-box declarations, delivery proof.',
        'Communications: chat messages (contact details auto-masked).',
        'Device & usage: push token, app interactions, IP address, and coarse location if granted.',
      ],
    },
    {
      heading: 'How we use it',
      paragraphs: [
        'To verify identity and prevent fraud, match senders and travellers, operate listings/bids/orders/escrow, process payments via our partner, enable masked messaging and notifications, resolve disputes, and meet legal and tax obligations. We do not sell your personal data.',
      ],
    },
    {
      heading: 'Service providers we share with',
      paragraphs: [
        'We share the minimum necessary with vetted providers that process data on our behalf — identity verification, our payment/escrow partner, cloud database and private file storage, email, push notifications, error tracking, and flight verification. Some may process data outside India under appropriate safeguards.',
      ],
    },
    {
      heading: 'What other users see',
      paragraphs: [
        'Counterparties see only a limited trust profile — your display name, rating, and verification badges — plus the masked chat. They do not see your ID documents, full contact details, or precise location.',
      ],
    },
    {
      heading: 'Retention & minimisation',
      paragraphs: [
        'We keep personal data only as long as needed or as the law requires. Raw KYC ID images are purged after the retention window once verification succeeds; we keep only the verification status and a masked ID number. On account deletion we anonymise your profile and purge your ID images, bank details, and sessions, while retaining anonymised transaction records for financial, tax, and dispute-audit obligations.',
      ],
    },
    {
      heading: 'Your rights',
      bullets: [
        'Access / export — download a copy of your data (Profile → Privacy & data).',
        'Erasure — delete your account (anonymise + purge), subject to active transactions and legal retention.',
        'Correction — update your profile.',
        'Withdraw consent — stop further processing (may limit your ability to transact).',
      ],
    },
    {
      heading: 'Security & children',
      paragraphs: [
        'We use encryption in transit, private storage with signed access, hashing/masking of sensitive identifiers, rate limiting, and audit logging. No system is perfectly secure; we will notify you of qualifying breaches as required. CarryMate is not for anyone under 18.',
      ],
    },
    {
      heading: 'Contact & grievances',
      paragraphs: [`For privacy questions, requests, or complaints, contact our Grievance Officer at ${SUPPORT_EMAIL}. We respond within the timelines required by the DPDP Act.`],
    },
  ],
};

export const LEGAL_DOCS = { terms: TERMS, privacy: PRIVACY } as const;
export type LegalDocKey = keyof typeof LEGAL_DOCS;
