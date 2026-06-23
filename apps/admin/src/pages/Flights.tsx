import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlaneTakeoff, BadgeCheck } from 'lucide-react';
import { api } from '@/lib/api';

export function Flights() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['pending-routes'], queryFn: api.pendingRoutes });

  const verify = useMutation({
    mutationFn: (id: string) => api.verifyRoute(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['pending-routes'] }),
    onError: (e) => window.alert((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Flight Verification</h2>
        <p className="text-sm text-muted-foreground">
          Trips not auto-verified by AviationStack. Check the ticket photo, then verify.
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
          <p className="mt-4 text-sm font-medium">No trips awaiting verification</p>
        </div>
      )}

      <div className="grid gap-3">
        {data?.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{r.route} · {r.departureDate}</p>
                <p className="text-sm text-muted-foreground">
                  {r.travelerName ?? 'Traveler'} · {r.airline ?? '—'} {r.flightNumber ?? ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.ticketFileKey ? (
                <span className="text-xs text-muted-foreground">ticket on file</span>
              ) : (
                <span className="text-xs text-red-600">no ticket</span>
              )}
              <button
                onClick={() => verify.mutate(r.id)}
                disabled={verify.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <BadgeCheck className="h-4 w-4" /> Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
