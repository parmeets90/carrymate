import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, BadgeCheck, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function FailedPayouts() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['failed-payouts'], queryFn: api.failedPayouts });

  const retry = useMutation({
    mutationFn: (orderId: string) => api.retryPayout(orderId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['failed-payouts'] }),
    onError: (e) => window.alert((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Failed Payouts</h2>
        <p className="text-sm text-muted-foreground">
          Travelers whose payout didn’t settle. Retry re-initiates the transfer.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <BadgeCheck className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium">No failed payouts</p>
        </div>
      )}

      <div className="grid gap-4">
        {data?.map((p) => (
          <div key={p.orderId} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div>
              <p className="font-semibold">
                {p.travelerName ?? 'Traveler'} · {inr(p.payoutInr)}
              </p>
              <p className="text-sm text-muted-foreground">{p.requestTitle}</p>
              {p.failureReason && (
                <p className="mt-1 text-xs text-red-600">{p.failureReason}</p>
              )}
            </div>
            <button
              onClick={() => retry.mutate(p.orderId)}
              disabled={retry.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" /> Retry payout
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
