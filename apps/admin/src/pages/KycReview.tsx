import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, ShieldCheck, Loader2, FileText } from 'lucide-react';
import { api, openFile } from '@/lib/api';

export function KycReview() {
  const qc = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kyc-pending'],
    queryFn: api.pendingKyc,
  });

  const approve = useMutation({
    mutationFn: (userId: string) => api.approveKyc(userId),
    onSettled: () => qc.invalidateQueries({ queryKey: ['kyc-pending'] }),
  });
  const reject = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      api.rejectKyc(userId, reason),
    onSettled: () => qc.invalidateQueries({ queryKey: ['kyc-pending'] }),
  });

  const onReject = (userId: string) => {
    const reason = window.prompt('Reason for rejection?');
    if (reason && reason.trim().length >= 3) reject.mutate({ userId, reason: reason.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">KYC Review</h2>
        <p className="text-sm text-muted-foreground">
          Approve or reject identity submissions. Users stay gated until verified.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
        </div>
      )}
      {isError && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <ShieldCheck className="h-10 w-10 text-emerald-500" />
          <p className="mt-4 text-sm font-medium">Queue is clear</p>
          <p className="mt-1 text-xs text-muted-foreground">No submissions awaiting review.</p>
        </div>
      )}

      <div className="grid gap-4">
        {data?.map(({ user, documents, failureReason, faceMatchScore, ocrConfidence }) => {
          const busy =
            (approve.isPending || reject.isPending) && pendingId === user.id;
          return (
            <div key={user.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{user.fullName ?? 'Unnamed user'}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.phone} · {user.role}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                  {user.kycStatus}
                </span>
              </div>

              {(failureReason || faceMatchScore != null) && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">
                  {failureReason && (
                    <p>
                      <span className="font-medium text-muted-foreground">Reason: </span>
                      {failureReason}
                    </p>
                  )}
                  {faceMatchScore != null && (
                    <p className="mt-0.5">
                      <span className="font-medium text-muted-foreground">IDFY: </span>
                      face match {faceMatchScore}% · OCR {ocrConfidence ?? '—'}%
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {documents.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => d.fileKey && openFile(d.fileKey)}
                    disabled={!d.fileKey}
                    className="flex items-center gap-1 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                    title={d.fileKey ? 'View document' : 'No file'}
                  >
                    <FileText className="h-3.5 w-3.5" /> {d.docType} · {d.status}
                  </button>
                ))}
                {documents.length === 0 && (
                  <span className="text-xs text-muted-foreground">No documents uploaded.</span>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setPendingId(user.id);
                    approve.mutate(user.id);
                  }}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => {
                    setPendingId(user.id);
                    onReject(user.id);
                  }}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive disabled:opacity-60"
                >
                  <X className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
