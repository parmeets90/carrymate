import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Loader2, Undo2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Pagination } from '@/components/Pagination';

const STATUS_STYLE: Record<string, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  ESCROW_HELD: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-red-100 text-red-700',
  DISPUTED: 'bg-red-100 text-red-700',
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function Transactions() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => api.orders(page),
    placeholderData: keepPreviousData,
  });

  const refund = useMutation({
    mutationFn: (id: string) => api.refundOrder(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-sm text-muted-foreground">Escrow orders and payouts. Refund holds when needed.</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Sender → Traveler</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Commission</th>
              <th className="px-4 py-3 font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {data?.items.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3 font-medium">{o.requestTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {o.senderName ?? '—'} → {o.travelerName ?? '—'}
                </td>
                <td className="px-4 py-3">{inr(o.amountInr)}</td>
                <td className="px-4 py-3">{inr(o.commissionInr)}</td>
                <td className="px-4 py-3">{inr(o.payoutInr)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {['PENDING_PAYMENT', 'ESCROW_HELD', 'DISPUTED'].includes(o.status) && (
                    <button
                      onClick={() => refund.mutate(o.id)}
                      disabled={refund.isPending}
                      className="flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
      </div>
    </div>
  );
}
