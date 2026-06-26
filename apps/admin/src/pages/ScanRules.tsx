import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ScanLine, Plus, Trash2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api, type ScanRuleInput } from '@/lib/api';
import type { ScanRuleDto, ScanRuleKind } from '@carrymate/shared';

const KIND_META: Record<ScanRuleKind, { label: string; cls: string; Icon: typeof ShieldAlert }> = {
  PROHIBITED: { label: 'Prohibited', cls: 'bg-red-50 text-red-700 border-red-200', Icon: ShieldAlert },
  ALLOWED: { label: 'Allowed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: ShieldCheck },
};

type Filter = 'ALL' | ScanRuleKind;

export function ScanRules() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['scan-rules'], queryFn: api.scanRules });

  const [filter, setFilter] = useState<Filter>('ALL');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<ScanRuleKind>('PROHIBITED');
  const [category, setCategory] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['scan-rules'] });
  const onErr = (e: unknown) => window.alert((e as Error).message);

  const create = useMutation({
    mutationFn: (input: ScanRuleInput) => api.createScanRule(input),
    onSuccess: () => {
      setLabel('');
      setCategory('');
      invalidate();
    },
    onError: onErr,
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ScanRuleInput> }) =>
      api.updateScanRule(id, input),
    onSettled: invalidate,
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteScanRule(id),
    onSettled: invalidate,
    onError: onErr,
  });

  const rules = useMemo(
    () => (data ?? []).filter((r) => filter === 'ALL' || r.kind === filter),
    [data, filter],
  );
  const counts = useMemo(() => {
    const all = data ?? [];
    return {
      ALL: all.length,
      PROHIBITED: all.filter((r) => r.kind === 'PROHIBITED').length,
      ALLOWED: all.filter((r) => r.kind === 'ALLOWED').length,
    };
  }, [data]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    create.mutate({ label: trimmed, kind, category: category.trim() || null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Smart Scan Rules</h2>
        <p className="text-sm text-muted-foreground">
          Labels the on-device open-box scanner uses to flag (Prohibited) or whitelist (Allowed) an
          item. Labels match the ML Kit image classifier — keep them lowercase and generic (e.g.
          “laptop”, “perfume”, “knife”). Inactive rules are ignored by the app.
        </p>
      </div>

      {/* Add rule */}
      <form
        onSubmit={submit}
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5 shadow-sm"
      >
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">ML Kit label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. laptop"
            className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Kind</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as ScanRuleKind)}
            className="h-9 w-full rounded-lg border bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="PROHIBITED">Prohibited</option>
            <option value="ALLOWED">Allowed</option>
          </select>
        </div>
        <div className="w-44">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Category <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. electronics"
            className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={create.isPending || label.trim().length < 2}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add rule
        </button>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PROHIBITED', 'ALLOWED'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              filter === f ? 'border-primary bg-primary/10 text-primary' : 'bg-card text-muted-foreground'
            }`}
          >
            {f === 'ALL' ? 'All' : KIND_META[f].label} · {counts[f]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && rules.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
          <ScanLine className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">No rules in this view</p>
          <p className="text-xs text-muted-foreground">Add one above to extend the scanner.</p>
        </div>
      )}

      {rules.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <Row
                  key={r.id}
                  rule={r}
                  busy={update.isPending || remove.isPending}
                  onToggle={(active) => update.mutate({ id: r.id, input: { active } })}
                  onChangeKind={(k) => update.mutate({ id: r.id, input: { kind: k } })}
                  onDelete={() => {
                    if (window.confirm(`Delete rule “${r.label}”?`)) remove.mutate(r.id);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({
  rule,
  busy,
  onToggle,
  onChangeKind,
  onDelete,
}: {
  rule: ScanRuleDto;
  busy: boolean;
  onToggle: (active: boolean) => void;
  onChangeKind: (kind: ScanRuleKind) => void;
  onDelete: () => void;
}) {
  const meta = KIND_META[rule.kind];
  return (
    <tr className={`border-b last:border-0 ${rule.active ? '' : 'opacity-50'}`}>
      <td className="px-4 py-3 font-medium">{rule.label}</td>
      <td className="px-4 py-3">
        <select
          value={rule.kind}
          disabled={busy}
          onChange={(e) => onChangeKind(e.target.value as ScanRuleKind)}
          className={`rounded-full border px-2 py-1 text-xs font-medium ${meta.cls}`}
        >
          <option value="PROHIBITED">Prohibited</option>
          <option value="ALLOWED">Allowed</option>
        </select>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{rule.category ?? '—'}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggle(!rule.active)}
          disabled={busy}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            rule.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
          }`}
          aria-label={rule.active ? 'Deactivate' : 'Activate'}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
              rule.active ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </td>
    </tr>
  );
}
