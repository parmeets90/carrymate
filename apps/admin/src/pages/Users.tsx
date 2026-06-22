import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  BANNED: 'bg-red-100 text-red-700',
};

export function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', q],
    queryFn: () => api.users(q),
    placeholderData: keepPreviousData,
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' }) =>
      api.setUserStatus(id, status),
    onSettled: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">Search accounts and manage access.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, phone, or email"
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">KYC</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {data?.items.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.fullName ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.kycStatus}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[u.status] ?? ''}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'ADMIN' && (
                    <div className="flex gap-1.5">
                      {u.status !== 'ACTIVE' && (
                        <button
                          onClick={() => setStatus.mutate({ id: u.id, status: 'ACTIVE' })}
                          className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                        >
                          Reactivate
                        </button>
                      )}
                      {u.status === 'ACTIVE' && (
                        <button
                          onClick={() => setStatus.mutate({ id: u.id, status: 'SUSPENDED' })}
                          className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
                        >
                          Suspend
                        </button>
                      )}
                      {u.status !== 'BANNED' && (
                        <button
                          onClick={() => setStatus.mutate({ id: u.id, status: 'BANNED' })}
                          className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Ban
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
