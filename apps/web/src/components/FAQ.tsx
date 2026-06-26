import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Eyebrow, Reveal } from './primitives';
import { PlusIcon, MinusIcon } from './icons';

const FAQS = [
  {
    q: 'Is it safe to hand my belongings to a stranger?',
    a: 'Every traveler is identity-verified, passport-checked and on a ticket-confirmed flight. Contents are inspected in an open-box declaration before they’re carried, your payment is held in escrow until you confirm delivery, and both sides rate each other. If anything goes wrong, you can open a dispute within two taps.',
  },
  {
    q: 'When does the traveler actually get paid?',
    a: 'Never before delivery. Your payment sits in escrow from the moment you book. It’s released to the traveler only after the recipient confirms receipt with a one-time handover code. If delivery fails or a dispute is resolved in your favour, it’s refunded.',
  },
  {
    q: 'What can I send — and what’s not allowed?',
    a: 'Personal items only: food, documents, clothing, gifts and similar personal effects. For the MVP we do not allow electronics, medicines, liquids, or high-value goods. Requests are screened against a prohibited-item list the moment they’re created, not at match time.',
  },
  {
    q: 'How is this cheaper than a courier?',
    a: 'Travelers are already flying with spare luggage allowance, so there’s no dedicated freight cost. You pay a modest carry fee plus our service fee — typically a fraction of the ₹4,500–7,500 a courier charges for a small personal parcel.',
  },
  {
    q: 'Won’t the traveler get in trouble at customs?',
    a: 'That’s exactly why open-box declaration and prohibited-item screening are mandatory. Travelers always know precisely what they’re carrying and that it’s legal for the corridor. We carry personal effects only — never commercial imports or goods bought to resell.',
  },
  {
    q: 'Which routes are live?',
    a: 'We’re launching India → UAE first — the densest, lowest-friction corridor. Canada and the USA are later phases, opening only once trust and liquidity metrics hold on the first corridor.',
  },
  {
    q: 'Can I be both a sender and a traveler?',
    a: 'Yes. One verified account holds both roles — send something on one trip, carry something on the next. You can switch roles anytime in your profile.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <Section id="faq" className="bg-bone">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <Reveal>
            <h2 className="mt-5 font-serif text-display-md text-ink">
              The things people ask before their first send.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
              Still unsure? That’s the point of building trust into every step — so the answer is
              always something you can verify, not just take on faith.
            </p>
          </Reveal>
        </div>

        <div>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={Math.min(i, 4) * 0.04}>
                <div className="border-b border-line">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[17px] font-semibold text-ink md:text-[18px]">{f.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink">
                      {isOpen ? <MinusIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-prose2 pb-7 text-[15px] leading-relaxed text-ink-soft">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
