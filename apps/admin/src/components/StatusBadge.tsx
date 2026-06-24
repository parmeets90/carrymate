import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Canonical status pill for every queue. One semantic vocabulary so operators
 * triage at a glance: success (money/approved/done), pending (in-flight),
 * danger (disputed/failed/banned), info, neutral. Dark-mode aware.
 */
export type Tone = 'success' | 'pending' | 'danger' | 'info' | 'neutral';

const TONE: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  neutral: 'bg-muted text-muted-foreground',
};

/** Map a domain status string onto a semantic tone. */
export function statusTone(status: string): Tone {
  switch (status) {
    case 'ACTIVE':
    case 'MATCHED':
    case 'DELIVERED':
    case 'ESCROW_HELD':
    case 'COMPLETED':
    case 'VERIFIED':
    case 'APPROVED':
    case 'RESOLVED':
    case 'PAID':
    case 'RELEASED':
      return 'success';
    case 'PENDING':
    case 'PENDING_PAYMENT':
    case 'IN_TRANSIT':
    case 'IN_REVIEW':
    case 'VERIFYING':
    case 'SUSPENDED':
    case 'BIDDING':
      return 'pending';
    case 'CANCELLED':
    case 'REFUNDED':
    case 'DISPUTED':
    case 'REJECTED':
    case 'BANNED':
    case 'FAILED':
      return 'danger';
    case 'OPEN':
    case 'EXPIRED':
      return 'info';
    default:
      return 'neutral';
  }
}

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
} as const;

/** A tone-styled pill. Use directly when the tone isn't status-derived (SLA, risk). */
export function Pill({
  tone,
  children,
  size = 'sm',
  uppercase,
  className,
}: {
  tone: Tone;
  children: ReactNode;
  size?: keyof typeof SIZES;
  uppercase?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        SIZES[size],
        TONE[tone],
        uppercase && 'font-bold uppercase tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status pill driven by a domain status string; renders the status, humanized. */
export function StatusBadge({
  status,
  size = 'sm',
  className,
}: {
  status: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Pill tone={statusTone(status)} size={size} className={className}>
      {status.replace(/_/g, ' ')}
    </Pill>
  );
}
