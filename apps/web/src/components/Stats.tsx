import { Reveal, Counter } from './primitives';

const STATS = [
  { to: 95, suffix: '%', label: 'Delivery success target', sub: 'on escrow-funded matches' },
  { to: 48, suffix: 'h', label: 'Median time-to-match', sub: 'on high-density routes' },
  { to: 4.3, suffix: 'M', decimals: 1, label: 'Indians in the UAE', sub: 'self-renewing traveler supply' },
  { to: 85, suffix: '%', label: 'KYC completion target', sub: 'of users who start' },
];

export function Stats() {
  return (
    <section className="border-y border-line bg-navy text-bone">
      <div className="wrap grid grid-cols-2 divide-x divide-bone/10 py-14 md:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08}>
            <div className="px-4 text-center md:px-8">
              <div className="font-serif text-display-md leading-none text-bone">
                <Counter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <p className="mt-3 text-[14px] font-semibold text-bone/90">{s.label}</p>
              <p className="mt-1 text-[12px] text-bone/50">{s.sub}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="wrap pb-8 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-bone/35">
        MVP targets &amp; market anchors from the CarryMate validation report — to be re-validated with primary research
      </p>
    </section>
  );
}
