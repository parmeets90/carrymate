import type { Config } from 'tailwindcss';

/**
 * CarryMate marketing design system — "warm editorial trust".
 *
 * A premium, Apple/Airbnb-grade system: a warm ivory canvas, deep-midnight
 * brand, an editorial variable serif (Fraunces) for display, a humanist
 * geometric sans (Plus Jakarta Sans) for UI, and mono for meta. Colour is a
 * scarce, semantic resource — gold = identity/trust, mint = money/escrow,
 * ember = human warmth/emotion, sky = links/info. Elevation is soft and
 * diffuse; borders are warm hairlines. All pairs meet WCAG AA on their surface.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces — warm ivory
        bone: '#FBF9F5',
        canvas: '#F4F1EA',
        surface: '#FFFFFF',
        sunken: '#EDE8DD',
        // Ink — warm near-black, never pure
        ink: '#1B1A16',
        'ink-soft': '#46443B',
        muted: '#6D6A60',
        faint: '#A19D90',
        // Hairlines (warm)
        line: '#E7E1D4',
        'line-strong': '#D9D2C2',
        // Brand — deep midnight
        navy: '#14203B',
        'navy-700': '#1F2C4E',
        'navy-800': '#101A30',
        // Links / info — refined blue
        sky: '#2E5FC0',
        'sky-600': '#274F9F',
        'sky-tint': '#E7EDFA',
        // Trust — gold (identity / flight / ratings)
        gold: '#A0710E',
        'gold-tint': '#F5EACF',
        'gold-border': '#E4CB8C',
        // Money — mint (escrow / delivered)
        mint: '#0C7E54',
        'mint-tint': '#DCEFE5',
        'mint-border': '#A6D8C2',
        // Human warmth / emotion — ember
        ember: '#BC5B33',
        'ember-tint': '#F6E6DB',
        'ember-border': '#E8C3AC',
        // Danger (scarce)
        clay: '#B4532A',
        'clay-tint': '#FAEDE6',
      },
      fontFamily: {
        // `display`/`serif` both map to Bricolage Grotesque — an expressive,
        // optically-sized grotesque that reads premium without the dated-serif
        // feel. `serif` is kept as an alias so existing `font-serif` headings
        // pick it up without a sweep.
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        serif: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // generous editorial display scale
        'display-2xl': ['clamp(3.4rem, 8.5vw, 7.5rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-xl': ['clamp(3rem, 7vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.022em' }],
        'display-lg': ['clamp(2.6rem, 5.6vw, 4.75rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2.05rem, 4.2vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.018em' }],
        title: ['clamp(1.5rem, 2.4vw, 2.1rem)', { lineHeight: '1.18', letterSpacing: '-0.012em' }],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      borderRadius: {
        xl2: '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        hair: '0 1px 0 0 rgba(27,26,22,0.04)',
        soft: '0 4px 14px -6px rgba(27,26,22,0.10)',
        lift: '0 22px 60px -22px rgba(27,26,22,0.20)',
        glow: '0 30px 90px -28px rgba(46,95,192,0.30)',
        ring: '0 0 0 1px rgba(27,26,22,0.06)',
      },
      maxWidth: {
        prose2: '44rem',
        wrap: '78rem',
      },
      spacing: {
        section: '8.5rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        dash: { to: { strokeDashoffset: '0' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        drift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(3%,-4%) scale(1.08)' },
        },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
