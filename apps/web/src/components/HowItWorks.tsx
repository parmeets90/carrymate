import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section, Eyebrow, Reveal, Tag } from './primitives';
import { ease } from '@/lib/motion';
import { BoxOpenIcon, LockIcon, ShieldIcon, CheckIcon, PlaneIcon, WalletIcon, RouteIcon, KeyIcon } from './icons';

type Role = 'sender' | 'traveler';

const STEPS: Record<Role, { icon: typeof BoxOpenIcon; title: string; body: string }[]> = {
  sender: [
    { icon: ShieldIcon, title: 'Verify once', body: 'Confirm your identity with a government ID. It takes a few minutes and is required before any money moves.' },
    { icon: BoxOpenIcon, title: 'Post your request', body: 'Describe the item, add photos, set a deadline. We screen it against the prohibited list before it goes live.' },
    { icon: LockIcon, title: 'Choose & pay into escrow', body: 'Pick a verified traveler on a confirmed flight. Your payment is held safely — not released yet.' },
    { icon: CheckIcon, title: 'Track to delivery', body: 'Follow each step and confirm receipt with a handover code. Only then is the traveler paid.' },
  ],
  traveler: [
    { icon: PlaneIcon, title: 'Add your trip', body: 'Verify your passport and upload your ticket. We confirm the flight so senders know it’s real.' },
    { icon: RouteIcon, title: 'Pick up requests on your route', body: 'Browse items that match where you’re already flying, and accept the ones that fit your bag.' },
    { icon: BoxOpenIcon, title: 'Open-box, then carry', body: 'Inspect the contents with the sender and declare them — so you always know exactly what you’re carrying.' },
    { icon: WalletIcon, title: 'Hand over & get paid', body: 'Confirm delivery with a code and photo. Escrow releases your earnings to your payout account.' },
  ],
};

export function HowItWorks() {
  const [role, setRole] = useState<Role>('sender');

  return (
    <Section id="how" className="bg-canvas">
      <div className="wrap">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Eyebrow>How it works</Eyebrow>
            <Reveal>
              <h2 className="mt-5 font-serif text-display-md text-ink">
                Four steps. One of them is always “trust”.
              </h2>
            </Reveal>
          </div>

          {/* role toggle */}
          <div className="relative inline-flex rounded-full border border-line-strong bg-surface p-1">
            {(['sender', 'traveler'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="relative z-10 rounded-full px-5 py-2 text-[14px] font-semibold capitalize transition-colors"
                aria-pressed={role === r}
              >
                <span className={role === r ? 'text-bone' : 'text-ink-soft'}>For {r}s</span>
                {role === r && (
                  <motion.span
                    layoutId="rolepill"
                    className="absolute inset-0 -z-10 rounded-full bg-navy"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="wait">
            {STEPS[role].map((s, i) => (
              <motion.div
                key={role + i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease, delay: i * 0.07 }}
                className="relative flex flex-col rounded-xl2 border border-line bg-surface p-7 shadow-hair"
              >
                <span className="font-mono text-[12px] text-faint">0{i + 1}</span>
                <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sunken text-navy">
                  <s.icon className="h-[22px] w-[22px]" />
                </div>
                <h3 className="mt-5 text-[17px] font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
                {i < 3 && (
                  <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bone text-faint lg:flex">
                    →
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Reveal>
          <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 rounded-xl2 border border-line bg-surface px-7 py-6">
            <div className="flex items-center gap-3">
              <KeyIcon className="h-5 w-5 text-mint" />
              <p className="text-[15px] text-ink-soft">
                <span className="font-semibold text-ink">Money is never released early.</span> Escrow
                holds it until the recipient confirms with a handover code.
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Tag tone="gold">10–20% take rate</Tag>
              <Tag tone="mint">Released on delivery</Tag>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
