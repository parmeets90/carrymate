import { forwardRef, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
  animate,
  type HTMLMotionProps,
} from 'framer-motion';
import clsx from 'clsx';
import { fadeUp, inView } from '@/lib/motion';
import { ArrowIcon } from './icons';

/* ---------- Section shell ---------- */
export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx('relative scroll-mt-24 py-24 md:py-32', className)}>
      {children}
    </section>
  );
}

/* ---------- Eyebrow label ---------- */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx('eyebrow inline-flex items-center gap-2', className)}>
      <span className="h-px w-6 bg-line-strong" aria-hidden />
      {children}
    </span>
  );
}

/* ---------- Reveal-on-scroll wrapper ---------- */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, inView);
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={seen ? 'show' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/* ---------- Magnetic, premium button ---------- */
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  withArrow?: boolean;
  children?: ReactNode;
} & Omit<HTMLMotionProps<'button'>, 'ref' | 'children'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', withArrow, className, children, ...props },
  ref,
) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  const styles = {
    primary:
      'bg-navy text-bone hover:bg-navy-700 shadow-soft hover:shadow-lift border border-navy',
    secondary: 'bg-surface text-ink border border-line-strong hover:border-ink/40 hover:shadow-soft',
    ghost: 'bg-transparent text-ink hover:bg-sunken border border-transparent',
  }[variant];

  return (
    <motion.button
      ref={ref}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors duration-300 ease-editorial focus-visible:outline-none',
        styles,
        className,
      )}
      {...props}
    >
      {children}
      {withArrow ? (
        <ArrowIcon className="h-[18px] w-[18px] transition-transform duration-300 ease-editorial group-hover:translate-x-1" />
      ) : null}
    </motion.button>
  );
});

/* ---------- Tag / pill ---------- */
export function Tag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'gold' | 'mint' | 'sky';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-sunken text-ink-soft',
    gold: 'bg-gold-tint text-gold',
    mint: 'bg-mint-tint text-mint',
    sky: 'bg-sky-tint text-sky-600',
  }[tone];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em]',
        tones,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Animated counter ---------- */
export function Counter({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  if (seen && val === 0 && to !== 0) {
    if (reduce) {
      setVal(to);
    } else {
      animate(0, to, {
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setVal(v),
      });
    }
  }

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
