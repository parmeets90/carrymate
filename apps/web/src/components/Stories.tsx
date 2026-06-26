import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Section, Eyebrow, Reveal } from './primitives';
import { HeartIcon } from './icons';

const STORIES = [
  {
    k: 'Pickle, still warm from home',
    sender: 'Anjali, Delhi',
    body: 'A mother makes her daughter’s favourite mango pickle. Courier would reject it, charge ₹6,000, and take two weeks. Instead a verified traveler on Thursday’s Dubai flight carries it in her spare bag — and it’s on the table by the weekend.',
    tint: 'bg-gold-tint',
    accent: 'text-gold',
  },
  {
    k: 'Transcripts, before the deadline',
    sender: 'Rohan, Pune',
    body: 'Original documents are due at a university abroad in four days. No courier can promise that. A traveler already flying the route hand-carries the envelope — tracked, declared, and signed for on arrival.',
    tint: 'bg-sky-tint',
    accent: 'text-sky-600',
  },
  {
    k: 'A Rakhi that had to arrive',
    sender: 'Priya, Bengaluru',
    body: 'It isn’t about the parcel’s value — it’s about being there. A sister ties the thread across an ocean because someone with room in their luggage chose to help, and was paid fairly for it.',
    tint: 'bg-mint-tint',
    accent: 'text-mint',
  },
];

export function Stories() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <Section id="why-it-matters" className="bg-bone">
      <div className="wrap">
        <div className="max-w-prose2">
          <Eyebrow>Why it matters</Eyebrow>
          <Reveal>
            <h2 className="mt-5 font-serif text-display-md text-ink">
              Before it’s a transaction, it’s a feeling someone is waiting for.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              People already post <span className="italic">“anyone flying to Dubai?”</span> in
              group chats every day. CarryMate gives that quiet act of kindness a safe, accountable
              home.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className="mt-16 grid gap-6 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.08}>
              <motion.article
                style={{ y: i === 1 ? y : undefined }}
                className="group flex h-full flex-col rounded-xl2 border border-line bg-surface p-7 shadow-hair transition-shadow duration-500 ease-editorial hover:shadow-lift"
              >
                <div className={`mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${s.tint} ${s.accent}`}>
                  <HeartIcon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-2xl leading-tight text-ink">{s.k}</h3>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">{s.body}</p>
                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {s.sender}
                </p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
