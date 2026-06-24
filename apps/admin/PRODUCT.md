# Product

## Register

product

## Users

**Internal CarryMate trust & safety / operations staff.** Small team, working a queue. Context: reviewing other people's identity documents, money movements, and disputes — making decisions that are often irreversible and that directly affect real users' money and access. They are time-pressured (a backlog of KYC and disputes), need to be accurate (a wrong KYC approval or payout release is costly), and switch between high-stakes judgment calls and bulk triage.

Primary jobs, drawn from the actual screens: approve/reject **KYC** submissions, resolve **disputes**, retry **failed payouts**, monitor **risk** signals, verify **flights**, inspect **transactions**, and manage **users** and the review **queue**.

## Product Purpose

The admin console is the human control plane behind CarryMate's trust guarantees. The consumer app promises KYC verification, escrow protection, and a dispute trail; this dashboard is where staff actually deliver on those promises — vetting identities, adjudicating disputes, releasing or holding money, and acting on rules-based risk flags. It exists so that the marketplace's safety claims are backed by real, auditable human review, not automation alone.

Success looks like staff clearing the queue quickly and confidently, with the information needed for each decision visible at a glance, and irreversible actions (approve KYC, release payout, resolve dispute) hard to trigger by accident.

## Brand Personality

**Efficient, precise, calm.** This is an internal tool, so it serves the operator, not a brand impression. Dense but legible. No decoration that doesn't aid a decision. Quiet by default; loud only where it must be — a risk flag, a destructive confirm, a failed payout. It should feel like a serious operations console that respects the operator's time and the weight of the decisions being made.

It still inherits CarryMate's overall stance: trustworthy and accountable. Every consequential action should be traceable and reversible-where-possible, or clearly gated where it isn't.

## Anti-references

- **Toy/startup admin dashboards** with big gradient hero cards, vanity metrics, and decorative charts that don't drive a decision. This is a working queue, not a pitch deck.
- **Wall-of-undifferentiated-table** dumps where the operator can't tell a routine row from one that needs attention. Status and risk must read instantly.
- **Hype-fintech styling** (neon, urgency, celebration). Money and identity decisions are handled soberly.

## Design Principles

1. **Decisions over data.** Every screen is organized around the action the operator must take next, not around displaying everything the database holds. Surface what the decision needs; tuck away the rest.
2. **Scannable status.** State (pending / approved / rejected / in-transit / disputed / failed) is encoded with consistent color + label so a queue can be triaged at a glance. Color never the only signal.
3. **Guard the irreversible.** Approving KYC, releasing/holding escrow, and resolving disputes are high-consequence. These actions are visually distinct, deliberately gated (confirm step), and never adjacent-by-accident to routine controls.
4. **Density with hierarchy.** Pack information efficiently — operators want a lot on screen — but maintain clear typographic and spacing hierarchy so density never becomes noise.
5. **Auditable and accountable.** Reflect the trail: who did what, when, and why. The UI should make the record visible, supporting the platform's accountability promise.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA.** Body text ≥4.5:1, large/bold ≥3:1; muted-foreground tokens must clear 4.5:1 for any real reading text, not just decoration.
- **Not color alone.** Status and risk are conveyed with text/icon in addition to color, so color-blind operators and grayscale conditions don't lose meaning — critical for a tool where status drives action.
- **Keyboard-friendly.** As a queue tool used all day, core flows (navigation, row actions, confirms) should be operable and clearly focus-ringed for keyboard users.
- Dark mode is implemented (`.dark` token set); both themes must meet contrast.
