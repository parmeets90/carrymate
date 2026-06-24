import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldCheck, ShieldAlert, Unlock } from 'lucide-react';
import { api } from '@/lib/api';
import { Pill, type Tone } from '@/components/StatusBadge';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function scoreTone(score: number): Tone {
  if (score >= 70) return 'danger';
  if (score >= 50) return 'pending';
  return 'neutral';
}

export function Risk() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['fraud-queue'], queryFn: api.fraudQueue });

  const clear = useMutation({
    mutationFn: (orderId: string) => api.clearHold(orderId),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['fraud-queue'] });
      qc.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
    onError: (e) => window.alert((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Risk &amp; Fraud</h2>
        <p className="text-sm text-muted-foreground">
          Rule-based scoring (0–100). Orders ≥50 are flagged; ≥70 auto-hold escrow until you clear them.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <ShieldCheck className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium">No flagged orders</p>
          <p className="text-xs text-muted-foreground">The risk engine hasn't flagged anything.</p>
        </div>
      )}

      <div className="grid gap-4">
        {data?.map((o) => (
          <div key={o.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {o.requestTitle} · {inr(o.amountInr)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {o.senderName ?? 'Sender'} → {o.travelerName ?? 'Traveler'} · {o.originCity} → {o.destinationCity}
                </p>
              </div>
              <Pill tone={scoreTone(o.riskScore)} size="md" className="shrink-0 font-bold">
                Risk {o.riskScore}
              </Pill>
            </div>

            {o.riskFactors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {o.riskFactors.map((f) => (
                  <span key={f} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {f.replace(/_/g, ' ').toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              {o.fraudHold ? (
                <span className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                  <ShieldAlert className="h-4 w-4" /> Escrow on hold
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Flagged (not held)</span>
              )}
              {o.fraudHold && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear the fraud hold and allow escrow release?')) clear.mutate(o.id);
                  }}
                  disabled={clear.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Unlock className="h-4 w-4" /> Clear hold
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
