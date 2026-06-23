import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Loader2, Inbox, Scale, ShieldAlert, ShieldCheck, Banknote, PackageSearch } from 'lucide-react';
import type { AdminQueueItem, SlaLevel } from '@carrymate/shared';
import { api } from '@/lib/api';

const KIND_ICON = {
  DISPUTE: Scale,
  FRAUD: ShieldAlert,
  REVIEW: PackageSearch,
  KYC: ShieldCheck,
  PAYOUT: Banknote,
} as const;

const SLA_STYLE: Record<SlaLevel, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

function age(h: number): string {
  if (h < 1) return '<1h';
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function Queue() {
  const nav = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-queue'],
    queryFn: api.queue,
    refetchInterval: 20_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Work Queue</h2>
        <p className="text-sm text-muted-foreground">
          Everything needing attention, prioritized. Color = SLA (green on time · amber slipping · red breached).
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <Inbox className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium">Queue is clear</p>
          <p className="text-xs text-muted-foreground">Nothing is waiting on you right now.</p>
        </div>
      )}

      <div className="grid gap-2">
        {data?.map((item: AdminQueueItem) => {
          const Icon = KIND_ICON[item.kind];
          return (
            <button
              key={`${item.kind}-${item.id}`}
              onClick={() => nav(item.link)}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition hover:bg-muted/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <span className="text-xs text-muted-foreground">{age(item.ageHours)}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${SLA_STYLE[item.sla]}`}>
                {item.sla}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
