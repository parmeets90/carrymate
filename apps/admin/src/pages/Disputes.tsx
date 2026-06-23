import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Scale, Check, Undo2, FileText } from 'lucide-react';
import { api, openFile } from '@/lib/api';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function Disputes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-disputes'], queryFn: api.disputes });

  const resolve = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'REFUND_SENDER' | 'RELEASE_TRAVELER' }) => {
      const note = window.prompt('Resolution note?') ?? '';
      if (note.trim().length < 3) return Promise.reject(new Error('A note is required.'));
      return api.resolveDispute(id, decision, note.trim());
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin-disputes'] }),
    onError: (e) => window.alert((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Disputes</h2>
        <p className="text-sm text-muted-foreground">
          Escrow is frozen until you resolve. Refund the sender or release to the traveler.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <Scale className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium">No open disputes</p>
        </div>
      )}

      <div className="grid gap-4">
        {data?.map((d) => (
          <div key={d.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{d.requestTitle} · {inr(d.amountInr)}</p>
                <p className="text-sm text-muted-foreground">
                  {d.senderName ?? 'Sender'} → {d.travelerName ?? 'Traveler'} · raised by{' '}
                  <span className="font-medium">{d.raisedByRole}</span>
                </p>
              </div>
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                {d.reason.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">{d.description}</p>
            {d.evidence.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {d.evidence.map((key, i) => (
                  <button
                    key={key}
                    onClick={() => openFile(key)}
                    className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs hover:bg-muted"
                  >
                    <FileText className="h-3.5 w-3.5" /> Evidence {i + 1}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => resolve.mutate({ id: d.id, decision: 'REFUND_SENDER' })}
                disabled={resolve.isPending}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
              >
                <Undo2 className="h-4 w-4" /> Refund sender
              </button>
              <button
                onClick={() => resolve.mutate({ id: d.id, decision: 'RELEASE_TRAVELER' })}
                disabled={resolve.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Check className="h-4 w-4" /> Release to traveler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
