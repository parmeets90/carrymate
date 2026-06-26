import { motion } from 'framer-motion';
import { ease, stagger, child } from '@/lib/motion';
import { Button, Tag } from './primitives';
import { RouteWorld } from './RouteWorld';
import { StarIcon } from './icons';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 md:pt-36">
      {/* ambient radial light — fixed, never scrolls, ultra low opacity */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(47,111,208,0.10),transparent)]" />
        <div className="absolute inset-0 grain opacity-60" />
      </div>

      <div className="wrap grid items-center gap-14 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          <motion.div variants={child}>
            <Tag tone="sky" className="mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Now live · India → UAE corridor
            </Tag>
          </motion.div>

          <motion.h1
            variants={child}
            className="font-serif text-display-xl text-ink"
          >
            Send the things that
            <br />
            <span className="italic text-navy">mean something</span> — carried
            <br />
            by people you can trust.
          </motion.h1>

          <motion.p
            variants={child}
            className="mt-7 max-w-prose2 text-lg leading-relaxed text-ink-soft"
          >
            Homemade food before it spoils. Documents before the deadline. A Rakhi that has to
            arrive on time. CarryMate moves your personal items along flights travelers are already
            taking — for a fraction of courier cost, with trust engineered into every step.
          </motion.p>

          <motion.div variants={child} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#download">
              <Button withArrow>Send something</Button>
            </a>
            <a href="#how">
              <Button variant="secondary">See how it works</Button>
            </a>
          </motion.div>

          <motion.div
            variants={child}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Rating />
            <div className="h-8 w-px bg-line" aria-hidden />
            <p className="max-w-[15rem] text-[13px] leading-snug text-muted">
              Every traveler is identity-verified, on a ticket-checked flight, and paid only after
              you confirm delivery.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease, delay: 0.15 }}
        >
          <RouteWorld />
        </motion.div>
      </div>

      {/* trust marquee strip */}
      <TrustStrip />
    </section>
  );
}

function Rating() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {['#EAF1FB', '#FBF1DC', '#E6F5EE', '#F2F1ED'].map((c, i) => (
          <span
            key={i}
            className="inline-block h-9 w-9 rounded-full border-2 border-bone"
            style={{ background: c }}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center gap-0.5 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-3.5 w-3.5" style={{ fill: '#B7791F' }} />
          ))}
        </div>
        <p className="mt-0.5 text-[13px] text-muted">
          Loved by senders &amp; travelers
        </p>
      </div>
    </div>
  );
}

const STRIP = [
  'Identity verified',
  'Passport checked',
  'Flight confirmed',
  'Open-box declared',
  'Escrow protected',
  'Delivery proof',
  'Two-way ratings',
  'Dispute support',
];

function TrustStrip() {
  return (
    <div className="relative border-y border-line bg-canvas/60">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bone to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bone to-transparent" />
      <div className="flex overflow-hidden py-4">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {[...STRIP, ...STRIP].map((s, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap">
              <span className="h-1 w-1 rounded-full bg-sky" />
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted">{s}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
