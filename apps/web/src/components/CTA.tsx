import { useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal, Button } from './primitives';
import { ArrowIcon, CheckIcon } from './icons';
import { useContent } from '@/lib/content';

export function CTA() {
  const { settings } = useContent();
  return (
    <section id="download" className="relative overflow-hidden bg-bone py-24 md:py-32">
      <div className="wrap">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-navy-700 bg-navy px-7 py-16 text-center text-bone md:px-16 md:py-24">
            {/* ambient */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-30%] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(47,111,208,0.30),transparent)]" />
              <div className="absolute inset-0 grain opacity-40" />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/55">
                India → UAE · now in pilot
              </p>
              <h2 className="mt-6 font-serif text-display-lg">
                Send something today that someone is waiting for.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-bone/70">
                Join the first travelers and senders on the corridor. Be matched, escrow-protected,
                and home in someone’s hands — not a warehouse.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <StoreButton store="App Store" href={settings.appStoreUrl || '#'} />
                <StoreButton store="Google Play" href={settings.playStoreUrl || '#'} />
              </div>

              <NewsletterForm />

              <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-bone/65">
                {['No account fee', 'Pay only on delivery', 'Cancel before handover, full refund'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 text-mint" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StoreButton({ store, href }: { store: string; href: string }) {
  return (
    <a href={href} aria-label={`Download on ${store}`}>
      <motion.span
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-3 rounded-2xl border border-bone/20 bg-bone/[0.06] px-5 py-3 text-left backdrop-blur transition-colors hover:bg-bone/[0.12]"
      >
        <span className="text-bone/80">
          {store === 'App Store' ? <AppleGlyph /> : <PlayGlyph />}
        </span>
        <span className="leading-tight">
          <span className="block text-[10px] uppercase tracking-wide text-bone/55">
            {store === 'App Store' ? 'Download on the' : 'Get it on'}
          </span>
          <span className="block text-[15px] font-semibold text-bone">{store}</span>
        </span>
      </motion.span>
    </a>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes('@')) setSent(true);
      }}
      className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-center"
    >
      <label htmlFor="cta-email" className="sr-only">
        Email address for early-access updates
      </label>
      <input
        id="cta-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        autoComplete="email"
        className="h-12 flex-1 rounded-full border border-bone/20 bg-bone/[0.06] px-5 text-[15px] text-bone placeholder:text-bone/40 focus:border-bone/40 focus:outline-none"
      />
      <Button type="submit" className="h-12 shrink-0 bg-bone !text-navy hover:bg-bone/90">
        {sent ? 'You’re in' : 'Notify me'}
        {sent ? <CheckIcon className="h-[18px] w-[18px]" /> : <ArrowIcon className="h-[18px] w-[18px]" />}
      </Button>
    </form>
  );
}

function AppleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8s-1.7-.8-2.8-.8c-1.4 0-2.8.8-3.5 2.1-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.5 2.2 2.6 2.1 1-.04 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1-.02 1.8-1 2.5-2a9 9 0 0 0 1.1-2.3c-.02-.01-2.1-.8-2.1-3.2zM14.3 6c.6-.7 1-1.7.9-2.7-.8.03-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6.9.07 1.8-.5 2.5-1.2z" />
    </svg>
  );
}
function PlayGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 3.5v17l9.5-8.5L4 3.5zm11.2 7.3 2.6-2.3 3.4 1.9c.9.5.9 1.7 0 2.2l-3.4 1.9-2.6-2.3 2.3-1.7-2.3-1.7zM5.8 4.3l8.2 7.2-1.9 1.7L5.8 4.3z" />
    </svg>
  );
}
