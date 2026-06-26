import { motion } from 'framer-motion';
import { ease, stagger, child } from '@/lib/motion';
import { Button, Tag } from './primitives';
import { JourneyScene } from './JourneyScene';
import { ArrowIcon } from './icons';

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* ---- layered cinematic background ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora absolute inset-0" />
        <div className="mesh-warm absolute inset-0 animate-drift opacity-80" />
        {/* fine vignette + grain for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,rgba(20,32,59,0.06))]" />
        <div className="absolute inset-0 grain opacity-40" />
        {/* hairline horizon */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
      </div>

      <div className="wrap grid items-center gap-12 pb-20 pt-32 sm:pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-28 lg:pt-44">
        {/* ---- copy ---- */}
        <motion.div variants={stagger(0.09)} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={child}>
            <Tag tone="sky" className="mb-7 shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Live · India&nbsp;→&nbsp;UAE corridor
            </Tag>
          </motion.div>

          <motion.h1
            variants={child}
            className="font-display text-[clamp(2.7rem,8.5vw,5.75rem)] font-bold leading-[0.98] tracking-tightest text-ink text-balance"
          >
            Send what{' '}
            <span className="text-gradient">matters most</span>
            <span className="block">— carried by people</span>
            <span className="block">you can trust.</span>
          </motion.h1>

          <motion.p
            variants={child}
            className="mt-7 max-w-[34rem] text-[17px] leading-[1.62] text-ink-soft sm:text-[19px]"
          >
            Homemade food before it spoils. Documents before the deadline. A festival gift that has
            to arrive on time. CarryMate moves your personal things along flights travelers are
            already taking — for a fraction of courier cost, with trust built into every step.
          </motion.p>

          <motion.div variants={child} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#download" className="w-full sm:w-auto">
              <Button withArrow className="w-full sm:w-auto">
                Send something
              </Button>
            </a>
            <a href="#how" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </motion.div>

          <motion.dl
            variants={child}
            className="mt-11 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-soft"
          >
            {[
              ['1/10ᵗʰ', 'of courier cost'],
              ['< 48h', 'to get matched'],
              ['100%', 'escrow-protected'],
            ].map(([n, l]) => (
              <div key={l} className="bg-bone/80 px-3 py-4 text-center">
                <dt className="font-display text-xl font-bold text-ink sm:text-2xl">{n}</dt>
                <dd className="mt-1 text-[11px] leading-tight text-muted">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ---- living journey scene ---- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.15 }}
          className="relative z-0"
        >
          <JourneyScene />
        </motion.div>
      </div>

      <ScrollCue />
      <TrustStrip />
    </section>
  );
}

function ScrollCue() {
  return (
    <div className="pointer-events-none hidden justify-center pb-2 lg:flex">
      <motion.a
        href="#why-it-matters"
        className="pointer-events-auto flex flex-col items-center gap-1 text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowIcon className="h-4 w-4 rotate-90" />
        </motion.span>
      </motion.a>
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
    <div className="relative border-y border-line bg-canvas/70">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bone to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bone to-transparent sm:w-24" />
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
