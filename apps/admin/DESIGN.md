# Design

Captured from the live system: `src/index.css` (HSL CSS-variable tokens), `tailwind.config.js`, and the pages/components under `src/`. Stack: Vite + React + TypeScript + Tailwind CSS, with a shadcn/ui-style token architecture (`hsl(var(--token))`). Class-based dark mode (`darkMode: ['class']`) with a full `.dark` token set.

> **Brand note (resolved 2026-06-24):** this console is now **brand-aligned to the mobile app** — navy `#0F1629` + sky-blue `#4FA3E0`, with gold reserved for identity/trust (matching mobile's semantic discipline). The former rose primary has been retired. Primary is a *deepened* sky (`hsl(207 74% 40%)`) so white-on-primary clears WCAG AA. The left nav is a **navy sidebar** mirroring the app's navy nav bar.

## Theme

Light-first operations console with a working dark mode. Clean white background, near-black slate foreground, generous neutral grays for chrome. The single saturated brand color (rose) is reserved for primary actions, focus rings, and active state; gold accent marks attention/trust-adjacent items; a true red is the destructive/danger signal. The intent is a dense, legible, calm console where color appears only to drive a decision.

## Color (HSL tokens)

Tokens are defined as raw HSL channel triplets consumed via `hsl(var(--token))`. Light (`:root`) / dark (`.dark`):

### Core surfaces
- `--background` `0 0% 100%` / `240 28% 10%`
- `--foreground` `240 28% 14%` / `0 0% 98%`
- `--card` `0 0% 100%` / `240 26% 13%` · `--card-foreground` matches foreground
- `--secondary` `240 20% 96%` / `240 20% 18%`
- `--muted` `240 16% 96%` / `240 20% 18%` · `--muted-foreground` `240 8% 46%` / `240 10% 64%`
- `--border` / `--input` `240 12% 90%` / `240 18% 22%`

### Brand & semantic
- `--primary` `347 78% 60%` (rose/crimson) — primary buttons, key actions; `--primary-foreground` white
- `--ring` `347 78% 60%` — focus ring (matches primary)
- `--accent` `38 92% 55%` (gold/amber) — attention / trust-adjacent highlights; `--accent-foreground` near-black
- `--destructive` `0 72% 51%` / `0 62% 46%` — destructive/danger actions; foreground white

**Contrast:** `--muted-foreground` (46% L light, 64% L dark) is acceptable for secondary text but must be checked at 4.5:1 wherever it carries real reading content; don't let it drift lighter. Status colors must pair with a label/icon — never color alone in a queue.

## Typography

**Inter** (with system fallbacks: `-apple-system, BlinkMicroSoft… Segoe UI, sans-serif`) applied on `body`, antialiased. Single-family, weight-driven hierarchy — appropriate for a dense data tool. No display/serif pairing. Keep tabular figures in mind for transaction/amount columns.

## Layout & Spacing

- **Container:** centered, `2rem` padding, max width `1400px` at `2xl`.
- Tailwind's default spacing scale; layout shell lives in `src/components/Layout.tsx` with `Pagination.tsx` for table paging.
- Pages are queue/table-oriented: Dashboard, KycReview, Disputes, FailedPayouts, Flights, Queue, Requests, Risk, Transactions, Users (+ Login, Placeholder).

## Radius

`--radius: 0.65rem` drives the scale: `lg = var(--radius)`, `md = radius - 2px`, `sm = radius - 4px`. Moderately rounded — softer than a bare data grid, restrained enough to stay utilitarian.

## Borders & Elevation

Global `* { @apply border-border }` — hairline borders are the default separation device (border-driven, not shadow-driven), which suits a dense console. Cards use `--card` surfaces against `--background`. Lean on borders and spacing over heavy shadows for structure.

## Components

Current: `Layout` (app shell / nav), `Pagination`. Pages compose tables, status cells, detail panels, and action controls directly. Patterns to standardize as the console grows:
- **Status badge** — consistent color+label per state (pending / approved / rejected / disputed / in-transit / failed) so queues triage at a glance.
- **Destructive/irreversible action** — `--destructive` for delete/reject/hold; primary actions in rose; high-consequence confirms (approve KYC, release payout) gated with an explicit confirm step and visually separated from routine controls.
- **Data table + Pagination** — the core surface; dense rows, clear column hierarchy, tabular numerics for money.

## Motion

Minimal by design — this is a throughput tool. Use quick, functional transitions (focus, hover, row/expand) on ease-out curves; no decorative or celebratory motion. Honor `prefers-reduced-motion` for any non-trivial transition.

## Brand reconciliation (resolved)

Resolved in favor of **alignment**: primary is now brand sky (deepened for AA), accent is gold for trust, and the sidebar is navy. The console reads as one product family with the mobile app. New `--success` (mint) and `--sidebar-*` tokens were added; status pills across queues should standardize on these semantic roles (gold=identity, mint/success=money/approved, red=danger/disputed, amber=pending, sky=info) — a shared `StatusBadge` is the recommended next consolidation.
