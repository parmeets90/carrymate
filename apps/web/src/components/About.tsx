import { Section, Eyebrow, Reveal } from './primitives';
import { useContent, type Accent } from '@/lib/content';

const TINT: Record<Accent, string> = {
  gold: 'bg-gold-tint',
  sky: 'bg-sky-tint',
  mint: 'bg-mint-tint',
  ember: 'bg-ember-tint',
};

const VALUES = [
  ['Trust before scale', 'Every trust mechanism ships before we spend on growth. A marketplace people trust strangers through is the only moat worth building.'],
  ['Personal, not commercial', 'We move personal effects between people — never goods bought to resell. That scope keeps senders, travelers and customs on the same side.'],
  ['Honest by default', 'Open-box declarations, real ratings, plain language. We’d rather under-promise and arrive than over-sell and fail.'],
];

const TIMELINE = [
  ['Phase 1', 'India → UAE', 'Highest route density, lowest customs friction. Prove delivery success, disputes and liquidity on one corridor.'],
  ['Phase 2', 'India → Canada', 'Add CBSA/CFIA rules and stronger automated risk scoring before higher-scrutiny lanes.'],
  ['Phase 3', 'India → USA', 'Open only once trust infrastructure is mature — likely starting with documents and sealed goods.'],
];

export function About() {
  const { founders } = useContent();
  return (
    <Section id="about" className="bg-canvas">
      <div className="wrap grid gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <Eyebrow>Our story</Eyebrow>
          <Reveal>
            <h2 className="mt-5 font-serif text-display-md text-ink">
              Built because the old way priced out love.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-soft">
              <p>
                International courier is structurally wrong for emotional, urgent, low-value
                shipments. ₹6,000 and two weeks to send a jar of pickle or a festival gift makes the
                cost-to-value ratio absurd — so people quietly turned to whoever was flying next.
              </p>
              <p>
                CarryMate formalises that informal kindness. We sit between travelers with spare
                luggage and senders with something that matters, as four layers: matching, trust,
                escrow and compliance. Our mission is simple — make distance feel a little smaller,
                safely.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-5 rounded-xl2 border border-line bg-surface p-7 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Mission</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">
                  Let anyone send the things that carry meaning across borders — affordably, and in
                  hands they can trust.
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Vision</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink">
                  The trusted, category-defining network for personal cross-border delivery — one
                  corridor at a time.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4">
            {VALUES.map(([t, b], i) => (
              <Reveal key={t} delay={i * 0.06}>
                <div className="flex gap-4 border-t border-line pt-4">
                  <span className="font-mono text-[12px] text-faint">0{i + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-bold text-ink">{t}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted">{b}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* founders + timeline */}
        <div className="lg:pt-16">
          <Reveal>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Founders</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {founders.map((f) => (
                  <figure
                    key={f.id}
                    className="group rounded-xl2 border border-line bg-surface p-6 text-center shadow-hair transition-all duration-500 ease-editorial hover:-translate-y-1 hover:shadow-lift"
                  >
                    {f.imageUrl ? (
                      <img
                        src={f.imageUrl}
                        alt={f.name}
                        loading="lazy"
                        width={80}
                        height={80}
                        className="mx-auto h-20 w-20 rounded-full object-cover ring-1 ring-line"
                      />
                    ) : (
                      <div
                        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${TINT[f.accent]} font-display text-2xl font-bold text-ink ring-1 ring-line`}
                      >
                        {f.initials}
                      </div>
                    )}
                    <figcaption className="mt-4 text-[15px] font-bold text-ink">{f.name}</figcaption>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{f.role}</p>
                  </figure>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-8 rounded-xl2 border border-line bg-surface p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Roadmap</p>
              <ol className="mt-5 space-y-6">
                {TIMELINE.map(([phase, route, body], i) => (
                  <li key={phase} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`h-3 w-3 rounded-full ${i === 0 ? 'bg-mint' : 'bg-line-strong'}`} />
                      {i < TIMELINE.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                    </div>
                    <div className="pb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{phase}</span>
                        <span className="text-[15px] font-bold text-ink">{route}</span>
                      </div>
                      <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
