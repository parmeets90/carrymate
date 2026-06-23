import { Fragment, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Loader2, ChevronDown, ChevronRight, Trash2, FileText } from 'lucide-react';
import { api, openFile } from '@/lib/api';
import { Pagination } from '@/components/Pagination';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  BANNED: 'bg-red-100 text-red-700',
};

/** Expandable detail row: the user's KYC docs with view links. */
function UserDetail({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['user', userId], queryFn: () => api.user(userId) });
  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (!data) return null;
  return (
    <div className="space-y-2 text-xs">
      {data.failureReason && <p className="text-amber-700">KYC note: {data.failureReason}</p>}
      {data.documents.length === 0 && <p className="text-muted-foreground">No documents uploaded.</p>}
      <div className="flex flex-wrap gap-2">
        {data.documents.map((d) => (
          <button
            key={d.id}
            onClick={() => d.fileKey && openFile(d.fileKey)}
            disabled={!d.fileKey}
            className="flex items-center gap-1 rounded-md border bg-card px-2 py-1 hover:bg-muted disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" /> {d.docType} · {d.status}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Users() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Debounce search; reset to page 1 whenever the query changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['users', debouncedQ, page],
    queryFn: () => api.users(debouncedQ, page),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });
  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' }) =>
      api.setUserStatus(id, status),
    onSettled: invalidate,
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSettled: invalidate,
    onError: (e) => window.alert((e as Error).message),
  });

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently delete ${name || 'this user'}? This cannot be undone.`)) del.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">Search accounts, review documents, and manage access.</p>
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
              <th className="px-4 py-3 font-medium" />
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
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {data?.items.map((u) => (
              <Fragment key={u.id}>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <button onClick={() => setExpanded(expanded === u.id ? null : u.id)} className="text-muted-foreground hover:text-foreground">
                      {expanded === u.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{u.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">{u.kycStatus}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[u.status] ?? ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && (
                      <div className="flex flex-wrap gap-1.5">
                        {u.status !== 'ACTIVE' && (
                          <button onClick={() => setStatus.mutate({ id: u.id, status: 'ACTIVE' })} className="rounded-md border px-2 py-1 text-xs hover:bg-muted">
                            Reactivate
                          </button>
                        )}
                        {u.status === 'ACTIVE' && (
                          <button onClick={() => setStatus.mutate({ id: u.id, status: 'SUSPENDED' })} className="rounded-md border px-2 py-1 text-xs hover:bg-muted">
                            Suspend
                          </button>
                        )}
                        {u.status !== 'BANNED' && (
                          <button onClick={() => setStatus.mutate({ id: u.id, status: 'BANNED' })} className="rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                            Ban
                          </button>
                        )}
                        <button onClick={() => confirmDelete(u.id, u.fullName ?? '')} className="flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {expanded === u.id && (
                  <tr className="border-t bg-muted/20">
                    <td />
                    <td colSpan={6} className="px-4 py-3">
                      <UserDetail userId={u.id} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {data && data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />}
      </div>
    </div>
  );
}
