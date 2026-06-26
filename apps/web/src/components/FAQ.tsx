import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Eyebrow, Reveal } from './primitives';
import { PlusIcon, MinusIcon } from './icons';
import { useContent } from '@/lib/content';

export function FAQ() {
  const { faqs } = useContent();
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
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.id} delay={Math.min(i, 4) * 0.04}>
                <div className="border-b border-line">
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[17px] font-semibold text-ink md:text-[18px]">{f.question}</span>
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
                          {f.answer}
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
