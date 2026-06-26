import { useRef } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { ShieldIcon, BoxOpenIcon, LockIcon, StarIcon } from './icons';

/**
 * The hero centrepiece: a living India → UAE journey. Two cities anchored by
 * skyline silhouettes (India Gate / Burj Khalifa), a great-circle flight arc
 * that draws itself, a plane that flies the arc trailing a gradient, pulsing
 * location pins, and floating glass trust chips. Layers parallax to the pointer.
 * All motion respects reduced-motion.
 */
const ARC = 'M118 250 C 210 60, 430 60, 522 250';

export function JourneyScene() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // pointer parallax
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 20 });
  const sy = useSpring(py, { stiffness: 120, damping: 20 });
  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 18);
    py.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 18);
  };

  // Fixed parallax layers (hooks must be top-level & stable).
  const xStage = useTransform(sx, (v) => v * 0.4);
  const yStage = useTransform(sy, (v) => v * 0.4);
  const xA = useTransform(sx, (v) => v * 1.4);
  const yA = useTransform(sy, (v) => v * 1.4);
  const xB = useTransform(sx, (v) => v * 1.8);
  const yB = useTransform(sy, (v) => v * 1.8);
  const xC = useTransform(sx, (v) => v * 1.1);
  const yC = useTransform(sy, (v) => v * 1.1);
  const xR = useTransform(sx, (v) => v * 0.8);
  const yR = useTransform(sy, (v) => v * 0.8);
  const L = reduce
    ? { stage: {}, a: {}, b: {}, c: {}, r: {} }
    : {
        stage: { x: xStage, y: yStage },
        a: { x: xA, y: yA },
        b: { x: xB, y: yB },
        c: { x: xC, y: yC },
        r: { x: xR, y: yR },
      };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className="relative mx-auto w-full max-w-[600px] select-none"
    >
      {/* glass stage */}
      <motion.div
        style={L.stage}
        className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-white/70 to-white/30 p-3 shadow-lift backdrop-blur-sm"
      >
        {/* sky wash */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(46,95,192,0.12),transparent_60%)]" />

        <svg viewBox="0 0 640 360" className="relative w-full" role="img" aria-label="A plane carries a package along a flight path from Delhi, India to Dubai, United Arab Emirates">
          <defs>
            <linearGradient id="js-arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2E5FC0" />
              <stop offset="0.5" stopColor="#A0710E" />
              <stop offset="1" stopColor="#0C7E54" />
            </linearGradient>
            <linearGradient id="js-trail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#BC5B33" stopOpacity="0" />
              <stop offset="1" stopColor="#BC5B33" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="js-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1F2C4E" />
              <stop offset="1" stopColor="#14203B" />
            </linearGradient>
          </defs>

          {/* faint lat/long grid */}
          <g stroke="#D9D2C2" strokeWidth="1" opacity="0.5">
            {[90, 160, 230].map((y) => (
              <line key={y} x1="40" y1={y} x2="600" y2={y} strokeDasharray="1 10" strokeLinecap="round" />
            ))}
          </g>

          {/* ground line */}
          <line x1="40" y1="300" x2="600" y2="300" stroke="#D9D2C2" strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round" />

          {/* INDIA — Delhi / India Gate */}
          <City x={70} flag="IN" name="Delhi" sub="India" tone="#E0931A">
            <IndiaGate />
          </City>
          {/* UAE — Dubai / Burj Khalifa */}
          <City x={470} flag="AE" name="Dubai" sub="UAE" tone="#0C7E54">
            <Burj />
          </City>

          {/* arc base (dotted) */}
          <path d={ARC} fill="none" stroke="#D9D2C2" strokeWidth="2" strokeDasharray="1 9" strokeLinecap="round" />
          {/* arc draw-on */}
          <motion.path
            d={ARC}
            fill="none"
            stroke="url(#js-arc)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease, delay: 0.3 }}
          />

          {/* pulsing pins */}
          <Pin x={118} y={250} reduce={reduce} color="#E0931A" />
          <Pin x={522} y={250} reduce={reduce} color="#0C7E54" delay={0.9} />

          {/* plane + trail flying the arc */}
          {!reduce ? (
            <motion.g
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: ['0%', '100%'] }}
              transition={{ duration: 6.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
              style={{ offsetPath: `path('${ARC}')`, offsetRotate: 'auto' }}
            >
              <path d="M-26 0 L-2 0" stroke="url(#js-trail)" strokeWidth="3" strokeLinecap="round" />
              <Plane />
            </motion.g>
          ) : (
            <g transform="translate(320,96)">
              <Plane />
            </g>
          )}

          {/* drifting clouds */}
          {!reduce &&
            [
              { x: 210, y: 120, s: 1, d: 0 },
              { x: 410, y: 150, s: 0.8, d: 2 },
            ].map((c, i) => (
              <motion.g
                key={i}
                initial={{ x: 0 }}
                animate={{ x: [0, 16, 0] }}
                transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: c.d }}
                transform={`translate(${c.x},${c.y}) scale(${c.s})`}
                opacity="0.7"
              >
                <Cloud />
              </motion.g>
            ))}
        </svg>
      </motion.div>

      {/* floating glass trust chips (parallax depth) — inset on mobile so they
          never poke past the viewport edge. */}
      <FloatChip className="left-[2%] top-[22%] sm:left-[-3%]" delay={1.0} style={L.a} tone="text-gold">
        <ShieldIcon className="h-4 w-4" /> Identity verified
      </FloatChip>
      <FloatChip className="right-[1%] top-[6%] sm:right-[-4%]" delay={1.2} style={L.b} tone="text-mint">
        <BoxOpenIcon className="h-4 w-4" /> Open-box checked
      </FloatChip>
      <FloatChip className="bottom-[10%] right-[3%]" delay={1.4} style={L.c} tone="text-sky-600">
        <LockIcon className="h-4 w-4" /> Escrow secured
      </FloatChip>

      {/* live rating tag */}
      <motion.div
        style={L.r}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7, ease }}
        className="absolute bottom-[6%] left-[2%] flex items-center gap-2 rounded-2xl border border-line glass px-3 py-2 shadow-soft sm:left-[-2%]"
      >
        <div className="flex -space-x-1.5">
          {['#F5EACF', '#F6E6DB', '#DCEFE5'].map((c) => (
            <span key={c} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />
          ))}
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-0.5 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="h-2.5 w-2.5" style={{ fill: '#A0710E' }} />
            ))}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">trusted carriers</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- SVG parts ---------- */
function City({
  x,
  flag,
  name,
  sub,
  tone,
  children,
}: {
  x: number;
  flag: string;
  name: string;
  sub: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <g transform={`translate(${x},0)`}>
      <g transform="translate(0,300)">{children}</g>
      {/* label chip */}
      <g transform="translate(-6,250)">
        <rect x="0" y="0" width="104" height="30" rx="15" fill="#FFFFFF" stroke="#E7E1D4" />
        <circle cx="17" cy="15" r="8" fill={tone} opacity="0.16" />
        <text x="17" y="18.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fontWeight="600" fill={tone}>
          {flag}
        </text>
        <text x="32" y="14" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="11" fontWeight="700" fill="#1B1A16">
          {name}
        </text>
        <text x="32" y="24" fontFamily="JetBrains Mono, monospace" fontSize="7.5" letterSpacing="0.5" fill="#6D6A60">
          {sub.toUpperCase()}
        </text>
      </g>
    </g>
  );
}

// Simplified India Gate silhouette.
function IndiaGate() {
  return (
    <g fill="url(#js-ground)" transform="translate(-26,-44)">
      <rect x="0" y="40" width="52" height="4" rx="1" />
      <path d="M8 40 V16 a18 18 0 0 1 36 0 V40 h-9 V18 a9 9 0 0 0-18 0 V40 z" />
      <rect x="6" y="8" width="40" height="6" rx="2" />
      <rect x="22" y="0" width="8" height="9" rx="1" />
    </g>
  );
}

// Simplified Burj Khalifa spire.
function Burj() {
  return (
    <g fill="url(#js-ground)" transform="translate(-14,-92)">
      <path d="M14 0 L17 0 L19 18 L23 30 L20 30 L22 52 L18 52 L19 92 L9 92 L10 52 L6 52 L8 30 L5 30 L9 18 z" />
      <rect x="13" y="-12" width="2" height="14" />
    </g>
  );
}

function Plane() {
  return (
    <g transform="rotate(0)">
      <circle r="13" fill="#14203B" />
      <g transform="translate(-7,-7)" stroke="#FBF9F5" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 8.5 2.5 9.5 1.8 8.2 4.8 6.4 3.8 2.6 5 2 7.6 6 10.9 5.3a1 1 0 0 1 .4 1.9L8.5 7.7 8.2 11l-1.2.6z" />
      </g>
    </g>
  );
}

function Pin({ x, y, color, reduce, delay = 0 }: { x: number; y: number; color: string; reduce: boolean | null; delay?: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {!reduce && (
        <motion.circle
          r="6"
          fill={color}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 3.2], opacity: [0.5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay }}
        />
      )}
      <circle r="5" fill="#FFFFFF" stroke={color} strokeWidth="2.5" />
      <circle r="2" fill={color} />
    </g>
  );
}

function Cloud() {
  return (
    <g fill="#FFFFFF">
      <circle cx="0" cy="0" r="8" />
      <circle cx="10" cy="2" r="10" />
      <circle cx="22" cy="0" r="7" />
      <rect x="-2" y="-2" width="26" height="8" rx="4" />
    </g>
  );
}

function FloatChip({
  children,
  className,
  delay,
  tone,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  tone: string;
  style?: object;
}) {
  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease }}
      className={`absolute ${className}`}
    >
      <div className={`flex items-center gap-2 rounded-full border border-line glass px-3 py-1.5 text-[12px] font-semibold shadow-soft animate-floaty ${tone}`}>
        {children}
      </div>
    </motion.div>
  );
}
