import { Wordmark } from './Nav';

const COLS = [
  {
    title: 'Product',
    links: [
      ['How it works', '#how'],
      ['Trust & safety', '#trust'],
      ['Technology', '#technology'],
      ['Why CarryMate', '#why'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '#about'],
      ['Our roadmap', '#about'],
      ['Careers', '#'],
      ['Press', '#'],
    ],
  },
  {
    title: 'Support',
    links: [
      ['FAQ', '#faq'],
      ['Contact', 'mailto:hello@carrymate.app'],
      ['Dispute help', '#'],
      ['Prohibited items', '#'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Privacy Policy', '#'],
      ['Terms of Service', '#'],
      ['DPDP & data requests', '#'],
      ['Compliance', '#'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="wrap py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-muted">
              A peer-to-peer way to send the things that matter across borders — carried by people
              you can trust.
            </p>
            <div className="mt-6 flex gap-2">
              {['in', 'X', 'IG'].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={s}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line-strong font-mono text-[11px] text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLS.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint">{c.title}</p>
                <ul className="mt-4 space-y-3">
                  {c.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="link-underline text-[14px] text-ink-soft hover:text-ink">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-[12px] text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CarryMate. Personal effects only — not a customs broker or courier.</p>
          <p className="font-mono uppercase tracking-[0.12em] text-faint">India → UAE · Built trust-first</p>
        </div>
      </div>
    </footer>
  );
}
