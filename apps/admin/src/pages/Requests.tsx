import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Loader2, Ban } from 'lucide-react';
import { api } from '@/lib/api';

const STATUSES = ['', 'OPEN', 'BIDDING', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-sky-100 text-sky-700',
  BIDDING: 'bg-indigo-100 text-indigo-700',
  MATCHED: 'bg-emerald-100 text-emerald-700',
  IN_TRANSIT: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function Requests() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', status],
    queryFn: () => api.requests(status),
    placeholderData: keepPreviousData,
  });

  const expire = useMutation({
    mutationFn: (id: string) => api.expireRequest(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin-requests'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Requests</h2>
        <p className="text-sm text-muted-foreground">Monitor marketplace requests and force-expire stale ones.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              status === s ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Weight</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Sender</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {data?.items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.originCity} → {r.destinationCity}
                </td>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3">{r.weightKg} kg</td>
                <td className="px-4 py-3 text-muted-foreground">{r.deadlineDate}</td>
                <td className="px-4 py-3">
                  {r.senderName ?? '—'} · {r.senderRating.toFixed(1)}★
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[r.status] ?? ''}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {['OPEN', 'BIDDING'].includes(r.status) && (
                    <button
                      onClick={() => expire.mutate(r.id)}
                      className="flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="h-3.5 w-3.5" /> Expire
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
