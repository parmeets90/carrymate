import { useQuery } from '@tanstack/react-query';
import { Activity, TrendingUp, Package, ShieldCheck, IndianRupee, Lock, Scale, ShieldAlert, Clock, Timer, AlarmClock } from 'lucide-react';
import { api } from '@/lib/api';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function Dashboard() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 15_000,
  });
  const metrics = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: api.metrics,
    refetchInterval: 30_000,
  });

  const m = metrics.data;
  const dash = (v: number | string | undefined) => (v === undefined ? '—' : String(v));
  const KPIS = [
    { label: 'Completed Deliveries', value: dash(m?.completed), hint: 'North Star (SVD)', icon: TrendingUp },
    { label: 'Active Requests', value: dash(m ? m.requestsTotal - m.requestsMatched : undefined), hint: 'Awaiting match', icon: Package },
    { label: 'Pending KYC', value: dash(m?.kycBacklog), hint: 'In review queue', icon: ShieldCheck },
    { label: 'Match Rate', value: m ? `${m.matchRate}%` : '—', hint: 'Matched / posted', icon: Activity },
    { label: 'GMV', value: m ? inr(m.gmvInr) : '—', hint: 'Completed order value', icon: IndianRupee },
    { label: 'Escrow Held', value: dash(m?.escrowHeld), hint: 'Funds in escrow', icon: Lock },
    { label: 'Open Disputes', value: m ? `${m.disputesOpen} (${m.disputeRate}%)` : '—', hint: 'Of all orders', icon: Scale },
    { label: 'Fraud Holds', value: dash(m?.fraudHolds), hint: 'Awaiting review', icon: ShieldAlert },
    { label: 'Avg KYC Review', value: m ? `${m.avgKycReviewMins}m` : '—', hint: 'Target < 120m', icon: Clock },
    { label: 'Avg Dispute Resolution', value: m ? `${m.avgDisputeResolutionHours}h` : '—', hint: 'Target < 24h', icon: Timer },
    { label: 'Oldest Open Dispute', value: m ? `${m.oldestOpenDisputeHours}h` : '—', hint: 'Alert if > 24h', icon: AlarmClock },
  ];

  const dbUp = health.data?.checks.database;
  const statusLabel = health.isLoading
    ? 'Checking…'
    : health.isError
      ? 'API unreachable'
      : health.data?.status === 'healthy'
        ? 'All systems operational'
        : 'Degraded';
  const statusColor = health.isError
    ? 'bg-destructive'
    : dbUp
      ? 'bg-emerald-500'
      : 'bg-amber-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Marketplace health, funnel and trust signals — live.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
          {statusLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold">Backend connectivity</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Live check against <code className="rounded bg-muted px-1.5 py-0.5">/health</code>.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd className="font-medium">{health.data?.status ?? '—'}</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Database</dt>
            <dd className="font-medium">{dbUp === undefined ? '—' : dbUp ? 'Connected' : 'Down'}</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Version</dt>
            <dd className="font-medium">{health.data?.version ?? '—'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
