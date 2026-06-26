import { Section, Eyebrow, Reveal } from './primitives';
import { CheckIcon, MinusIcon } from './icons';

const ROWS = [
  { label: 'Cost for a 2 kg personal item', cm: '~₹400 carry fee', courier: '₹4,500–7,500', social: 'Unpredictable / favours' },
  { label: 'Speed', cm: 'Next available flight', courier: '7–14 days', social: 'Whenever, if at all' },
  { label: 'Identity verified', cm: true, courier: 'partial', social: false },
  { label: 'Flight confirmed', cm: true, courier: 'n/a', social: false },
  { label: 'Open-box declaration', cm: true, courier: false, social: false },
  { label: 'Secure escrow', cm: true, courier: false, social: false },
  { label: 'Delivery proof & ratings', cm: true, courier: 'tracking only', social: false },
  { label: 'Recourse if it goes wrong', cm: 'Dispute + refund', courier: 'Claims process', social: 'None' },
  { label: 'Human connection', cm: true, courier: false, social: 'sometimes' },
];

function Cell({ v, accent }: { v: string | boolean; accent?: boolean }) {
  if (v === true)
    return (
      <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${accent ? 'text-mint' : 'text-ink-soft'}`}>
        <CheckIcon className={`h-4 w-4 ${accent ? 'text-mint' : 'text-muted'}`} /> Yes
      </span>
    );
  if (v === false)
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-faint">
        <MinusIcon className="h-4 w-4" /> No
      </span>
    );
  return <span className={`text-[13px] ${accent ? 'font-semibold text-ink' : 'text-muted'}`}>{v}</span>;
}

export function Compare() {
  return (
    <Section id="why" className="bg-canvas">
      <div className="wrap">
        <div className="max-w-prose2">
          <Eyebrow>Why CarryMate</Eyebrow>
          <Reveal>
            <h2 className="mt-5 font-serif text-display-md text-ink">
              Cheaper than courier. Safer than a group chat.
            </h2>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-12 overflow-hidden rounded-xl2 border border-line bg-surface shadow-soft">
            {/* header */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] items-stretch border-b border-line bg-sunken/50">
              <div className="px-5 py-4" />
              <div className="border-l border-line bg-navy px-5 py-4 text-bone">
                <p className="text-[15px] font-bold">CarryMate</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/55">Verified · escrowed</p>
              </div>
              <div className="border-l border-line px-5 py-4">
                <p className="text-[15px] font-semibold text-ink">Courier</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">DHL / FedEx</p>
              </div>
              <div className="border-l border-line px-5 py-4">
                <p className="text-[15px] font-semibold text-ink">Group chat</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">WhatsApp / FB</p>
              </div>
            </div>

            {ROWS.map((r, i) => (
              <div
                key={r.label}
                className={`grid grid-cols-[1.4fr_1fr_1fr_1fr] items-center ${i % 2 ? 'bg-bone/40' : 'bg-surface'}`}
              >
                <div className="px-5 py-4 text-[14px] font-medium text-ink-soft">{r.label}</div>
                <div className="h-full border-l border-line bg-navy/[0.03] px-5 py-4">
                  <Cell v={r.cm} accent />
                </div>
                <div className="border-l border-line px-5 py-4">
                  <Cell v={r.courier} />
                </div>
                <div className="border-l border-line px-5 py-4">
                  <Cell v={r.social} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="mt-4 text-center text-[12px] text-faint">
            Illustrative comparison for a typical 2 kg personal shipment on the India → UAE corridor.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
