import { createContext, useContext } from 'react';

/* ---------- Types (mirror the backend SiteContent DTO) ---------- */
export type Accent = 'gold' | 'mint' | 'sky' | 'ember';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
  accent: Accent;
}
export interface Founder {
  id: string;
  name: string;
  role: string;
  initials: string;
  imageUrl: string;
  accent: Accent;
}
export interface Faq {
  id: string;
  question: string;
  answer: string;
}
export interface SiteSettings {
  brandName: string;
  tagline: string;
  contactEmail: string;
  supportEmail: string;
  contactPhone: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
}
export interface SiteContent {
  settings: SiteSettings;
  founders: Founder[];
  testimonials: Testimonial[];
  faqs: Faq[];
}

/* ---------- Static fallback (identical to the seeded DB content) ---------- */
export const FALLBACK: SiteContent = {
  settings: {
    brandName: 'CarryMate',
    tagline:
      'A peer-to-peer way to send the things that matter across borders — carried by people you can trust.',
    contactEmail: 'hello@carrymate.app',
    supportEmail: 'support@carrymate.app',
    contactPhone: '',
    twitterUrl: '#',
    instagramUrl: '#',
    linkedinUrl: '#',
    appStoreUrl: '#',
    playStoreUrl: '#',
  },
  founders: [
    { id: 'f1', name: 'Aamir Wani', role: 'Trust & Operations', initials: 'AW', imageUrl: '', accent: 'gold' },
    { id: 'f2', name: 'Rishav Tiwari', role: 'Growth & Community', initials: 'RT', imageUrl: '', accent: 'ember' },
    { id: 'f3', name: 'Parmeet Singh', role: 'Product & Engineering', initials: 'PS', imageUrl: '', accent: 'sky' },
  ],
  testimonials: [
    {
      id: 't1',
      quote:
        'My mother sends pickle and snacks every few weeks now. It actually arrives fresh, and I always know who’s carrying it. It feels like home reaching me.',
      name: 'Sana K.',
      role: 'Recipient · Dubai',
      rating: 5,
      accent: 'gold',
    },
    {
      id: 't2',
      quote:
        'I fly Mumbai–Dubai for work twice a month with half-empty bags. Now those trips pay for themselves, and the open-box step means I’m never carrying anything I haven’t seen.',
      name: 'Vikram R.',
      role: 'Traveler · 31 deliveries',
      rating: 5,
      accent: 'sky',
    },
    {
      id: 't3',
      quote:
        'Transcripts had to reach my university in four days. Courier couldn’t promise it. A verified traveler hand-carried them and I confirmed delivery with a code. Lifesaver.',
      name: 'Rohan M.',
      role: 'Sender · Pune',
      rating: 5,
      accent: 'mint',
    },
  ],
  faqs: [
    {
      id: 'q1',
      question: 'Is it safe to hand my belongings to a stranger?',
      answer:
        'Every traveler is identity-verified, passport-checked and on a ticket-confirmed flight. Contents are inspected in an open-box declaration before they’re carried, your payment is held in escrow until you confirm delivery, and both sides rate each other. If anything goes wrong, you can open a dispute within two taps.',
    },
    {
      id: 'q2',
      question: 'When does the traveler actually get paid?',
      answer:
        'Never before delivery. Your payment sits in escrow from the moment you book. It’s released to the traveler only after the recipient confirms receipt with a one-time handover code. If delivery fails or a dispute is resolved in your favour, it’s refunded.',
    },
    {
      id: 'q3',
      question: 'What can I send — and what’s not allowed?',
      answer:
        'Personal items only: food, documents, clothing, gifts and similar personal effects. For the MVP we do not allow electronics, medicines, liquids, or high-value goods. Requests are screened against a prohibited-item list the moment they’re created, not at match time.',
    },
    {
      id: 'q4',
      question: 'How is this cheaper than a courier?',
      answer:
        'Travelers are already flying with spare luggage allowance, so there’s no dedicated freight cost. You pay a modest carry fee plus our service fee — typically a fraction of the ₹4,500–7,500 a courier charges for a small personal parcel.',
    },
    {
      id: 'q5',
      question: 'Won’t the traveler get in trouble at customs?',
      answer:
        'That’s exactly why open-box declaration and prohibited-item screening are mandatory. Travelers always know precisely what they’re carrying and that it’s legal for the corridor. We carry personal effects only — never commercial imports or goods bought to resell.',
    },
    {
      id: 'q6',
      question: 'Which routes are live?',
      answer:
        'We’re launching India → UAE first — the densest, lowest-friction corridor. Canada and the USA are later phases, opening only once trust and liquidity metrics hold on the first corridor.',
    },
    {
      id: 'q7',
      question: 'Can I be both a sender and a traveler?',
      answer:
        'Yes. One verified account holds both roles — send something on one trip, carry something on the next. You can switch roles anytime in your profile.',
    },
  ],
};

/** Pull live content from the API; fall back to the static copy on any failure. */
export async function fetchContent(): Promise<SiteContent> {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) return FALLBACK;
  try {
    const res = await fetch(`${base}/v1/site/content`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return FALLBACK;
    const body = await res.json();
    const data = body?.data as SiteContent | undefined;
    if (!data?.settings) return FALLBACK;
    // Guard against an admin emptying a collection — keep the static copy so the
    // page never looks broken.
    return {
      settings: data.settings,
      founders: data.founders?.length ? data.founders : FALLBACK.founders,
      testimonials: data.testimonials?.length ? data.testimonials : FALLBACK.testimonials,
      faqs: data.faqs?.length ? data.faqs : FALLBACK.faqs,
    };
  } catch {
    return FALLBACK;
  }
}

export const ContentContext = createContext<SiteContent>(FALLBACK);
export const useContent = () => useContext(ContentContext);
