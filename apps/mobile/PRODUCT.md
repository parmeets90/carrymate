# Product

## Register

product

## Users

Two roles on one app (the app detects role and renders the matching tab set; users switch role in Profile).

- **Senders** — people in India who need an item carried to someone in the UAE. Context: at home or on the move, often anxious about whether a stranger can be trusted with their parcel and their money. Job to be done: get my item delivered across the border safely, by someone verified, without getting scammed or losing my payment.
- **Travelers** — people already flying India → UAE with spare luggage allowance who want to earn on a trip they're taking anyway. Context: planning or mid-trip, want clarity on what they're carrying, what they'll earn, and that they won't be liable for someone else's prohibited goods. Job to be done: monetize spare baggage with minimal risk and a clear payout.

The shared anxiety on both sides is **trust between strangers moving money and goods across a border**. Every screen exists to lower that anxiety.

## Product Purpose

CarryMate is a peer-to-peer cross-border luggage marketplace (India → UAE in MVP). It connects senders with vetted travelers, holds payment in escrow, and enforces an open-box declaration before any item is accepted. It exists because informal "can you carry this?" arrangements are common but unsafe — no identity verification, no payment protection, no accountability if something goes wrong. CarryMate productizes that exchange with KYC, flight verification, escrow, and a dispute trail.

Success looks like a sender and a traveler who have never met completing a handoff and a delivery confirmation with neither party feeling they took an unmanaged risk — and coming back to do it again.

## Brand Personality

**Trustworthy, calm, accountable.**

- **Voice/tone:** plain, reassuring, never hype. Tells people exactly what's happening and what protects them ("Released only on delivery confirm", "Arjun is in the air…"). Concrete over clever.
- **Emotional goal:** the quiet confidence of an institution that has thought about safety so the user doesn't have to. Closer to a bank's escrow flow than a social marketplace. Excitement is never the lever; relief and assurance are.
- Trust is carried by verification signals (KYC, flight confirmed, escrow secured, ratings) shown consistently, not by visual loudness.

## Anti-references

- **Sketchy peer classifieds (OLX / Facebook Marketplace energy).** No cluttered, low-trust, anyone-can-post feel. The product's entire reason to exist is being the opposite of this; identity, escrow, and accountability must read on every screen.
- **Crypto / hype fintech.** No neon gradients, no get-rich urgency, no growth-hacky dopamine patterns, no countdown-pressure. Money states are calm and protective, never exciting.

## Design Principles

1. **Trust is the interface.** Every traveler card, every money state, every transition either reinforces safety/legitimacy/accountability or it doesn't earn its place. The trust-badge system (KYC, flight confirmed, escrow secured, delivered) is the single most important visual element.
2. **Show the protection, always.** Escrow is never silent — it appears with a lock and "Released only on delivery confirm." Reassurance copy is mandatory in anxious moments (in-transit, matching, handoff), not optional polish.
3. **No safety step is skippable.** KYC before any transaction, open-box declaration before accepting any item, prohibited-items check at request creation. The UI never offers a path around these; they are presented as protection, not friction.
4. **Calm under money and risk.** When goods or payment are in motion, the design lowers the temperature — steady states, plain language, a dispute path always within reach (≤2 taps from any active request). Never urgency theater.
5. **Color carries meaning, consistently.** Gold = identity/flight trust, green = money/escrow/delivery, red = disputes/prohibited, amber = in-transit/pending. A color is never used decoratively in a way that dilutes its semantic job.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA.** Body text ≥4.5:1 contrast against its background; large/bold text ≥3:1. Placeholder and hint text held to the same bar — no light-gray-for-elegance.
- **Reduced motion is not optional.** Every animation has a `useReducedMotion()` fallback to an instant state change (already mandated in CLAUDE.md). Honors the OS reduce-motion setting.
- **Not color alone.** Because gold/green/red/amber carry real meaning (trust, money, danger, transit), every semantic state pairs color with an icon and a text label so it survives color-blindness and grayscale. The trust-badge anatomy already enforces `[icon] [label]`.
- **Tap targets** sized per the component spec (primary button 52px, inputs 48px, 22px nav icons) to stay comfortably tappable.
