import type { Config } from 'tailwindcss';

/**
 * CarryMate marketing design system.
 *
 * Lens: editorial / premium-utilitarian minimalism over a trust-first fintech
 * brand. Warm-neutral canvas, ink text, hairline borders, soft diffuse
 * elevation, and scarce brand/pastel spot colour (navy/sky = brand,
 * gold = identity & trust, mint = escrow & money). Display type is an editorial
 * serif; UI/body is a geometric sans; meta is mono.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Canvas & surfaces (warm neutral)
        bone: '#FBFBFA',
        canvas: '#F7F6F3',
        surface: '#FFFFFF',
        sunken: '#F2F1ED',
        // Ink (never pure black)
        ink: '#1A2233',
        'ink-soft': '#3A4256',
        muted: '#6B7384',
        faint: '#9AA1B0',
        // Hairlines
        line: '#E7E5DF',
        'line-strong': '#DAD8D0',
        // Brand — navy / sky
        navy: '#0F1B33',
        'navy-700': '#13294F',
        sky: '#2F6FD0',
        'sky-600': '#2A63BB',
        'sky-tint': '#EAF1FB',
        // Trust — gold (identity / flight / ratings)
        gold: '#B7791F',
        'gold-tint': '#FBF1DC',
        // Money — mint (escrow / delivered)
        mint: '#0E8F5E',
        'mint-tint': '#E6F5EE',
        // Caution / danger (semantic, scarce)
        clay: '#B4532A',
        'clay-tint': '#FAEDE6',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // editorial display scale
        'display-xl': ['clamp(3rem, 7vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.5rem, 5.5vw, 4.5rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        'title': ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        // ultra-diffuse, low opacity — never heavy
        hair: '0 1px 0 0 rgba(26,34,51,0.04)',
        soft: '0 2px 8px rgba(26,34,51,0.05)',
        lift: '0 12px 40px -12px rgba(26,34,51,0.14)',
        glow: '0 24px 80px -24px rgba(47,111,208,0.28)',
      },
      maxWidth: {
        prose2: '46rem',
        wrap: '76rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        dash: {
          to: { strokeDashoffset: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
