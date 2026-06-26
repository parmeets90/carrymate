import { Section, Eyebrow, Reveal, Tag } from './primitives';
import {
  IdIcon,
  PassportIcon,
  PlaneIcon,
  BoxOpenIcon,
  LockIcon,
  ShieldIcon,
  ChatIcon,
  StarIcon,
  ScaleIcon,
  CameraIcon,
  KeyIcon,
  CpuIcon,
} from './icons';

const LAYERS = [
  { icon: IdIcon, title: 'Identity verification', body: 'Every user confirms a government ID before they can send or carry. No anonymous accounts.', tone: 'gold' as const },
  { icon: PassportIcon, title: 'Passport verification', body: 'Travelers verify their passport — the same document they’ll carry through the border.', tone: 'gold' as const },
  { icon: PlaneIcon, title: 'Flight verification', body: 'We check the traveler’s ticket against the real flight, so a route is never just a claim.', tone: 'gold' as const },
  { icon: BoxOpenIcon, title: 'Open-box declaration', body: 'Contents are inspected and declared with the sender present — before anything is carried.', tone: 'mint' as const },
  { icon: ShieldIcon, title: 'Prohibited-item screening', body: 'Requests are screened against a per-corridor prohibited list at the moment they’re created.', tone: 'mint' as const },
  { icon: CameraIcon, title: 'Photo proof', body: 'Handover and delivery are captured as timestamped, geotagged photos for an honest record.', tone: 'mint' as const },
  { icon: KeyIcon, title: 'OTP / handover code', body: 'Delivery is confirmed by a one-time code only the recipient holds — no code, no release.', tone: 'sky' as const },
  { icon: LockIcon, title: 'Secure escrow', body: 'Funds are held the moment a booking is made and released only on confirmed delivery.', tone: 'sky' as const },
  { icon: ChatIcon, title: 'Secure, masked messaging', body: 'Chat stays in-app with contact details masked, and the log is admissible as dispute evidence.', tone: 'sky' as const },
  { icon: StarIcon, title: 'Two-way ratings', body: 'Senders and travelers rate each other, building reputation and repeat-carrier badges.', tone: 'neutral' as const },
  { icon: ScaleIcon, title: 'Dispute resolution', body: 'Either side can open a dispute within the SLA window; escrow freezes until an admin decides.', tone: 'neutral' as const },
  { icon: CpuIcon, title: 'Risk scoring & monitoring', body: 'Account, transaction and behaviour signals are scored and reviewable end-to-end by admins.', tone: 'neutral' as const },
];

const toneMap = {
  gold: 'bg-gold-tint text-gold',
  mint: 'bg-mint-tint text-mint',
  sky: 'bg-sky-tint text-sky-600',
  neutral: 'bg-sunken text-navy',
};

export function Trust() {
  return (
    <Section id="trust" className="bg-navy text-bone">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5]">
        <div className="absolute right-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(47,111,208,0.22),transparent)]" />
        <div className="absolute left-[-8%] bottom-[6%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(14,143,94,0.18),transparent)]" />
      </div>

      <div className="wrap relative">
        <div className="max-w-2xl">
          <Eyebrow className="text-bone/55">Trust, engineered</Eyebrow>
          <Reveal>
            <h2 className="mt-5 font-serif text-display-md">
              Safer than a stranger in a group chat — by design.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-5 text-lg leading-relaxed text-bone/70">
              The matching is the easy part. What makes people comfortable handing belongings to
              someone they’ve never met is a stack of checks that runs quietly in the background —
              from the first sign-up to the final signature.
            </p>
          </Reveal>
        </div>

        {/* featured escrow card */}
        <Reveal>
          <div className="mt-14 grid gap-6 overflow-hidden rounded-xl2 border border-bone/12 bg-bone/[0.04] p-8 md:grid-cols-[1.1fr_1fr] md:p-10">
            <div>
              <Tag tone="mint" className="mb-5">Escrow</Tag>
              <h3 className="font-serif text-3xl md:text-4xl">Your money waits until your package arrives.</h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-bone/70">
                When you book, your payment is locked in escrow — visibly held, never touched. The
                traveler is paid only after the recipient confirms delivery with their handover code.
                If something goes wrong before then, it comes back to you.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Tag tone="sky">Held on booking</Tag>
                <Tag tone="gold">Released on confirm</Tag>
                <Tag tone="mint">Refundable in dispute</Tag>
              </div>
            </div>
            <EscrowVisual />
          </div>
        </Reveal>

        {/* layer grid */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-xl2 border border-bone/12 bg-bone/12 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((l, i) => (
            <Reveal key={l.title} delay={(i % 3) * 0.05}>
              <div className="group h-full bg-navy p-7 transition-colors duration-500 hover:bg-navy-700">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneMap[l.tone]}`}>
                  <l.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[16px] font-bold text-bone">{l.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-bone/60">{l.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-8 text-center text-[13px] text-bone/45">
            Compliance checks · End-to-end encrypted document storage · Admin review on every flagged
            transaction
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

function EscrowVisual() {
  const rows = [
    { label: 'Carry fee', value: '₹350' },
    { label: 'Service & protection', value: '₹70' },
    { label: 'Insurance (optional)', value: '₹40' },
  ];
  return (
    <div className="rounded-xl2 border border-bone/12 bg-navy-700/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone/55">Escrow held</span>
        <span className="flex items-center gap-1.5 rounded-full bg-mint-tint px-2.5 py-1 text-[11px] font-semibold text-mint">
          <LockIcon className="h-3.5 w-3.5" /> Locked
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-[14px]">
            <span className="text-bone/60">{r.label}</span>
            <span className="tabular-nums text-bone/90">{r.value}</span>
          </div>
        ))}
        <div className="my-3 h-px bg-bone/12" />
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-bone">Total held</span>
          <span className="tabular-nums text-[20px] font-bold text-bone">₹460</span>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-bone/[0.06] px-3 py-2.5 text-[12px] text-bone/70">
        <KeyIcon className="h-4 w-4 text-mint" />
        Released to the traveler only when you confirm receipt.
      </div>
    </div>
  );
}
