import { Section, Eyebrow, Reveal } from './primitives';
import { CpuIcon, SparkIcon, LockIcon, RouteIcon, ShieldIcon, GlobeIcon } from './icons';

const TECH = [
  {
    icon: SparkIcon,
    title: 'Rules-based fraud screening',
    body: 'Prohibited items are caught synchronously at request creation, and an on-device Smart Scan helps travelers double-check contents at open-box time.',
  },
  {
    icon: CpuIcon,
    title: 'Risk analysis pipeline',
    body: 'Account, velocity and behaviour signals feed a reviewable risk store — starting rules-based, designed to grow into ML scoring as data matures.',
  },
  {
    icon: RouteIcon,
    title: 'Smart matching engine',
    body: 'Requests are surfaced to travelers by route, date and capacity, with liquidity signals that prioritise the busiest corridors.',
  },
  {
    icon: ShieldIcon,
    title: 'Verification pipeline',
    body: 'Identity, passport and flight checks run through an auditable pipeline with admin review on anything ambiguous.',
  },
  {
    icon: LockIcon,
    title: 'Encrypted & idempotent payments',
    body: 'PII and documents are encrypted at rest and in transit; escrow operations are transactional — no double-charge, no double-release.',
  },
  {
    icon: GlobeIcon,
    title: 'Corridor-ready architecture',
    body: 'New corridors are added by configuration, not rewrites — so Canada and the US can follow once trust and liquidity hold.',
  },
];

export function Technology() {
  return (
    <Section id="technology" className="bg-bone">
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Under the hood</Eyebrow>
            <Reveal>
              <h2 className="mt-5 font-serif text-display-md text-ink">
                A trust marketplace is a technology problem.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
                We describe our technology plainly and never oversell it. Today that means strong
                verification, secure escrow, encrypted data and rules-based screening — with a
                roadmap toward machine-learning risk detection as the network grows.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-10 grid grid-cols-2 gap-6">
                {[
                  ['TLS 1.2+', 'In transit'],
                  ['AES-256', 'At rest'],
                  ['99.9%', 'Uptime target'],
                  ['< 2s', 'p95 core load'],
                ].map(([a, b]) => (
                  <div key={a} className="border-l border-line-strong pl-4">
                    <dt className="font-serif text-3xl text-ink">{a}</dt>
                    <dd className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{b}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {TECH.map((t, i) => (
              <Reveal key={t.title} delay={(i % 2) * 0.06}>
                <div className="group h-full rounded-xl2 border border-line bg-surface p-7 shadow-hair transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-lift">
                  <t.icon className="h-6 w-6 text-navy transition-transform duration-500 group-hover:scale-110" />
                  <h3 className="mt-5 text-[16px] font-bold text-ink">{t.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
