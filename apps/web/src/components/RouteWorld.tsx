import { motion, useReducedMotion } from 'framer-motion';
import { ease } from '@/lib/motion';
import { BoxOpenIcon, ShieldIcon, PlaneIcon } from './icons';

/**
 * The hero illustration: two cities joined by a hand-drawn arc, a package that
 * travels the arc, and a verified traveler avatar. It communicates human
 * connection across distance — not logistics. All motion is transform/opacity
 * and respects reduced-motion.
 */
export function RouteWorld() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* soft ambient halo */}
      <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl">
        <div className="absolute left-[8%] top-[20%] h-40 w-40 rounded-full bg-sky/20" />
        <div className="absolute right-[6%] bottom-[18%] h-44 w-44 rounded-full bg-mint/20" />
      </div>

      <svg viewBox="0 0 560 440" className="w-full" role="img" aria-label="A package travels along a flight path from one city to another between two people">
        <defs>
          <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2F6FD0" />
            <stop offset="1" stopColor="#0E8F5E" />
          </linearGradient>
        </defs>

        {/* dotted ground line */}
        <line x1="40" y1="360" x2="520" y2="360" stroke="#DAD8D0" strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />

        {/* origin card */}
        <CityCard x={36} y={250} label="Delhi" sub="Sender" />
        {/* destination card */}
        <CityCard x={380} y={250} label="Dubai" sub="Recipient" />

        {/* flight arc, drawn on enter */}
        <motion.path
          d="M96 250 C 180 70, 380 70, 464 250"
          fill="none"
          stroke="url(#arc)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 9"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease, delay: 0.3 }}
        />

        {/* package riding the arc */}
        {!reduce && (
          <motion.g
            initial={{ offsetDistance: '0%' }}
            animate={{ offsetDistance: ['0%', '100%'] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.4 }}
            style={{ offsetPath: "path('M96 250 C 180 70, 380 70, 464 250')", offsetRotate: '0deg' }}
          >
            <g transform="translate(-19,-19)">
              <rect width="38" height="38" rx="11" fill="#0F1B33" />
              <g transform="translate(7,7) scale(1)" stroke="#FBFBFA" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7 12 9.5 22 7" />
                <path d="M12 9.5V21" />
                <path d="m2 7 2-4 8 2.2L20 3l2 4-10 2.5z" />
              </g>
            </g>
          </motion.g>
        )}
        {reduce && (
          <g transform="translate(280,108)">
            <rect x="-19" y="-19" width="38" height="38" rx="11" fill="#0F1B33" />
          </g>
        )}

        {/* little plane near apex */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          transform="translate(280,150)"
          className="text-gold"
        >
          <PlaneIcon className="h-5 w-5" style={{ color: '#B7791F' }} x={-10} y={-10} />
        </motion.g>
      </svg>

      {/* floating trust chips layered over the SVG */}
      <FloatChip className="left-[2%] top-[40%]" delay={1.0} tone="gold">
        <ShieldIcon className="h-4 w-4" />
        Identity verified
      </FloatChip>
      <FloatChip className="right-[0%] top-[8%]" delay={1.25} tone="mint">
        <BoxOpenIcon className="h-4 w-4" />
        Open-box checked
      </FloatChip>
      <FloatChip className="bottom-[6%] left-[28%]" delay={1.5} tone="sky">
        <PlaneIcon className="h-4 w-4" />
        Flight confirmed
      </FloatChip>
    </div>
  );
}

function CityCard({ x, y, label, sub }: { x: number; y: number; label: string; sub: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect width="124" height="86" rx="16" fill="#FFFFFF" stroke="#E7E5DF" />
      <circle cx="26" cy="30" r="13" fill="#EAF1FB" />
      <path d="M20 30c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#2F6FD0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="25.5" r="3.2" fill="#2F6FD0" />
      <text x="48" y="27" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="15" fontWeight="700" fill="#1A2233">
        {label}
      </text>
      <text x="48" y="44" fontFamily="JetBrains Mono, monospace" fontSize="9.5" letterSpacing="1" fill="#6B7384">
        {sub.toUpperCase()}
      </text>
      <rect x="16" y="60" width="92" height="8" rx="4" fill="#F2F1ED" />
      <rect x="16" y="60" width="54" height="8" rx="4" fill="#E6F5EE" />
    </g>
  );
}

function FloatChip({
  children,
  className,
  delay,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  tone: 'gold' | 'mint' | 'sky';
}) {
  const tones = {
    gold: 'text-gold',
    mint: 'text-mint',
    sky: 'text-sky-600',
  }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease }}
      className={`absolute ${className}`}
    >
      <div className={`flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3 py-1.5 text-[12px] font-semibold shadow-soft backdrop-blur ${tones} animate-floaty`}>
        {children}
      </div>
    </motion.div>
  );
}
