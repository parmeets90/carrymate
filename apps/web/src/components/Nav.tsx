import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Button } from './primitives';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#trust', label: 'Trust' },
  { href: '#technology', label: 'Technology' },
  { href: '#why', label: 'Why CarryMate' },
  { href: '#faq', label: 'FAQ' },
];

export function Nav() {
  const { scrollYProgress, scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 24));

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={clsx(
            'transition-all duration-500 ease-editorial',
            solid ? 'border-b border-line bg-bone/80 backdrop-blur-xl' : 'border-b border-transparent',
          )}
        >
          <nav className="wrap flex h-16 items-center justify-between">
            <a href="#top" className="flex items-center gap-2" aria-label="CarryMate home">
              <Wordmark />
            </a>

            <div className="hidden items-center gap-8 md:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="link-underline text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <a href="#download" className="hidden md:block">
                <Button variant="ghost" className="h-10 px-4 text-[14px]">
                  Sign in
                </Button>
              </a>
              <a href="#download">
                <Button className="h-10 px-5 text-[14px]" withArrow>
                  Get the app
                </Button>
              </a>
              <button
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-strong md:hidden"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                <div className="space-y-1.5">
                  <span className={clsx('block h-px w-5 bg-ink transition-transform', open && 'translate-y-[3px] rotate-45')} />
                  <span className={clsx('block h-px w-5 bg-ink transition-transform', open && '-translate-y-[3px] -rotate-45')} />
                </div>
              </button>
            </div>
          </nav>
        </div>
        {/* scroll progress hairline */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="h-[2px] origin-left bg-gradient-to-r from-sky via-sky-600 to-mint"
        />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bone/95 backdrop-blur-xl md:hidden"
          >
            <div className="wrap flex flex-col gap-2 pt-24">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-line py-4 font-serif text-3xl text-ink"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx('flex items-center gap-2.5 text-ink', className)}>
      <img src="/logo-mark.png" alt="" width={34} height={34} className="h-[34px] w-[34px]" />
      <span className="text-[20px] font-bold tracking-[-0.02em]">
        Carry<span className="text-[#E0931A]">Mate</span>
      </span>
    </span>
  );
}
