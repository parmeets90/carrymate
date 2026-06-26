import { Section, Eyebrow, Reveal } from './primitives';
import { StarIcon } from './icons';
import { useContent, type Accent } from '@/lib/content';

const TINT: Record<Accent, string> = {
  gold: 'bg-gold-tint',
  sky: 'bg-sky-tint',
  mint: 'bg-mint-tint',
  ember: 'bg-ember-tint',
};

export function Testimonials() {
  const { testimonials } = useContent();
  return (
    <Section className="bg-bone">
      <div className="wrap">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <Eyebrow>From the community</Eyebrow>
            <Reveal>
              <h2 className="mt-5 font-serif text-display-md text-ink">
                The first stories people tell are about feelings, not parcels.
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <p className="max-w-xs text-[14px] text-muted">
              Composite stories drawn from the journeys CarryMate is built for — illustrative of the
              pilot experience.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((q, i) => (
            <Reveal key={q.id} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-xl2 border border-line bg-surface p-7 shadow-hair transition-shadow duration-500 hover:shadow-lift">
                <div className="flex items-center gap-0.5 text-gold">
                  {Array.from({ length: q.rating }).map((_, j) => (
                    <StarIcon key={j} className="h-4 w-4" style={{ fill: '#A0710E' }} />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 font-serif text-xl leading-snug text-ink">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${TINT[q.accent]} font-semibold text-ink`}>
                    {q.name[0]}
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold text-ink">{q.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
