import type { Variants } from 'framer-motion';

// Shared editorial easing — slow-out, settles softly.
export const ease = [0.16, 1, 0.3, 1] as const;

/** Fade up — the default reveal for content blocks. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/** Container that staggers its children's reveals. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** A single staggered child (pairs with `stagger`). */
export const child: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/** Blur-to-focus, used sparingly on hero media. */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: 'blur(14px)', scale: 1.02 },
  show: { opacity: 1, filter: 'blur(0px)', scale: 1, transition: { duration: 1.1, ease } },
};

// Standard viewport config: animate once, a touch before fully in view.
export const inView = { once: true, amount: 0.3, margin: '0px 0px -10% 0px' } as const;
