import { Section, Eyebrow, Reveal } from './primitives';
import { StarIcon } from './icons';

const QUOTES = [
  {
    quote:
      'My mother sends pickle and snacks every few weeks now. It actually arrives fresh, and I always know who’s carrying it. It feels like home reaching me.',
    name: 'Sana K.',
    role: 'Recipient · Dubai',
    tint: 'bg-gold-tint',
  },
  {
    quote:
      'I fly Mumbai–Dubai for work twice a month with half-empty bags. Now those trips pay for themselves, and the open-box step means I’m never carrying anything I haven’t seen.',
    name: 'Vikram R.',
    role: 'Traveler · 31 deliveries',
    tint: 'bg-sky-tint',
  },
  {
    quote:
      'Transcripts had to reach my university in four days. Courier couldn’t promise it. A verified traveler hand-carried them and I confirmed delivery with a code. Lifesaver.',
    name: 'Rohan M.',
    role: 'Sender · Pune',
    tint: 'bg-mint-tint',
  },
];

export function Testimonials() {
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
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-xl2 border border-line bg-surface p-7 shadow-hair transition-shadow duration-500 hover:shadow-lift">
                <div className="flex items-center gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <StarIcon key={j} className="h-4 w-4" style={{ fill: '#B7791F' }} />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 font-serif text-xl leading-snug text-ink">
                  “{q.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${q.tint} font-semibold text-ink`}>
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
