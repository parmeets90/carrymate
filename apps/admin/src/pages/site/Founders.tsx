import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { api, type FounderInput, type SiteAccentValue } from '@/lib/api';
import type { FounderDto } from '@carrymate/shared';
import { Panel, Labelled, TextInput, AccentField, ActiveToggle, accentDot, PageHead } from '@/components/cms';

const EMPTY: FounderInput = { name: '', role: '', initials: '', imageUrl: '', accent: 'sky', sortOrder: 0, active: true };

export function Founders() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cms-founders'], queryFn: api.founders });
  const [editing, setEditing] = useState<FounderDto | null>(null);
  const [draft, setDraft] = useState<FounderInput | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms-founders'] });
  const onErr = (e: unknown) => window.alert((e as Error).message);

  const save = useMutation({
    mutationFn: () => (editing ? api.updateFounder(editing.id, draft!) : api.createFounder(draft!)),
    onSuccess: () => {
      setDraft(null);
      setEditing(null);
      invalidate();
    },
    onError: onErr,
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.updateFounder(id, { active }),
    onSettled: invalidate,
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteFounder(id),
    onSettled: invalidate,
    onError: onErr,
  });

  const openNew = () => {
    setEditing(null);
    setDraft({ ...EMPTY, sortOrder: data?.length ?? 0 });
  };
  const openEdit = (f: FounderDto) => {
    setEditing(f);
    setDraft({ name: f.name, role: f.role, initials: f.initials, imageUrl: f.imageUrl, accent: f.accent, sortOrder: f.sortOrder, active: f.active });
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Founders"
        desc="The people shown in the About section. Initials render as the avatar; position controls left-to-right order."
        action={
          <button onClick={openNew} className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> Add founder
          </button>
        }
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((f) => (
          <div key={f.id} className={`rounded-xl border bg-card p-5 text-center shadow-sm ${f.active ? '' : 'opacity-60'}`}>
            <div className="flex items-center justify-between">
              <span className={`h-2.5 w-2.5 rounded-full ${accentDot(f.accent)}`} />
              <ActiveToggle active={f.active} busy={toggle.isPending} onToggle={(active) => toggle.mutate({ id: f.id, active })} />
            </div>
            {f.imageUrl ? (
              <img
                src={f.imageUrl}
                alt={f.name}
                className="mx-auto mt-2 h-16 w-16 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-bold">
                {f.initials}
              </div>
            )}
            <p className="mt-3 text-[15px] font-bold">{f.name}</p>
            <p className="text-xs text-muted-foreground">{f.role}</p>
            <div className="mt-4 flex justify-center gap-1">
              <button onClick={() => openEdit(f)} className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => window.confirm(`Delete ${f.name}?`) && remove.mutate(f.id)}
                className="rounded-md border p-1.5 text-red-600 hover:bg-red-50"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {data && data.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-card py-16 text-center text-sm text-muted-foreground">
            No founders yet.
          </div>
        )}
      </div>

      <Panel
        open={draft !== null}
        title={editing ? 'Edit founder' : 'New founder'}
        onClose={() => setDraft(null)}
        footer={
          <>
            <button onClick={() => setDraft(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !draft?.name || !draft?.initials}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </>
        }
      >
        {draft && (
          <>
            <Labelled label="Name">
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Aamir Wani" />
            </Labelled>
            <Labelled label="Role">
              <TextInput value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Trust & Operations" />
            </Labelled>
            <Labelled label="Photo URL" hint="Paste a hosted image link. Leave empty to show the initials avatar.">
              <div className="flex items-center gap-3">
                {draft.imageUrl ? (
                  <img src={draft.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-border" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {draft.initials || '—'}
                  </span>
                )}
                <TextInput
                  value={draft.imageUrl ?? ''}
                  onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                  placeholder="https://…/photo.jpg"
                />
              </div>
            </Labelled>
            <div className="grid grid-cols-2 gap-3">
              <Labelled label="Initials" hint="1–4 letters">
                <TextInput maxLength={4} value={draft.initials} onChange={(e) => setDraft({ ...draft, initials: e.target.value.toUpperCase() })} placeholder="AW" />
              </Labelled>
              <Labelled label="Position">
                <TextInput type="number" min={0} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
              </Labelled>
            </div>
            <Labelled label="Accent colour">
              <AccentField value={draft.accent as SiteAccentValue} onChange={(accent) => setDraft({ ...draft, accent })} />
            </Labelled>
          </>
        )}
      </Panel>
    </div>
  );
}
