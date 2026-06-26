import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { api, type FaqInput } from '@/lib/api';
import type { FaqItemDto } from '@carrymate/shared';
import { Panel, Labelled, TextInput, TextArea, ActiveToggle, PageHead } from '@/components/cms';

const EMPTY: FaqInput = { question: '', answer: '', sortOrder: 0, active: true };

export function WebsiteFaq() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cms-faqs'], queryFn: api.faqs });
  const [editing, setEditing] = useState<FaqItemDto | null>(null);
  const [draft, setDraft] = useState<FaqInput | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms-faqs'] });
  const onErr = (e: unknown) => window.alert((e as Error).message);

  const save = useMutation({
    mutationFn: () => (editing ? api.updateFaq(editing.id, draft!) : api.createFaq(draft!)),
    onSuccess: () => {
      setDraft(null);
      setEditing(null);
      invalidate();
    },
    onError: onErr,
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.updateFaq(id, { active }),
    onSettled: invalidate,
    onError: onErr,
  });
  const remove = useMutation({ mutationFn: (id: string) => api.deleteFaq(id), onSettled: invalidate, onError: onErr });

  const openNew = () => {
    setEditing(null);
    setDraft({ ...EMPTY, sortOrder: data?.length ?? 0 });
  };
  const openEdit = (f: FaqItemDto) => {
    setEditing(f);
    setDraft({ question: f.question, answer: f.answer, sortOrder: f.sortOrder, active: f.active });
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="FAQ"
        desc="Questions shown in the marketing-site FAQ accordion. Order top-to-bottom with the position field."
        action={
          <button onClick={openNew} className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> Add question
          </button>
        }
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {data?.map((f, i) => (
          <div key={f.id} className={`flex items-start gap-4 border-b px-5 py-4 last:border-0 ${f.active ? '' : 'opacity-60'}`}>
            <span className="mt-0.5 font-mono text-xs text-muted-foreground">#{f.sortOrder}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{f.question}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{f.answer}</p>
            </div>
            <ActiveToggle active={f.active} busy={toggle.isPending} onToggle={(active) => toggle.mutate({ id: f.id, active })} />
            <div className="flex gap-1">
              <button onClick={() => openEdit(f)} className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => window.confirm('Delete this question?') && remove.mutate(f.id)}
                className="rounded-md border p-1.5 text-red-600 hover:bg-red-50"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {i < 0 && null}
          </div>
        ))}
        {data && data.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">No questions yet.</div>
        )}
      </div>

      <Panel
        open={draft !== null}
        title={editing ? 'Edit question' : 'New question'}
        onClose={() => setDraft(null)}
        footer={
          <>
            <button onClick={() => setDraft(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !draft?.question || !draft?.answer}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </>
        }
      >
        {draft && (
          <>
            <Labelled label="Question">
              <TextArea rows={2} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
            </Labelled>
            <Labelled label="Answer">
              <TextArea rows={6} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
            </Labelled>
            <Labelled label="Position">
              <TextInput type="number" min={0} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
            </Labelled>
          </>
        )}
      </Panel>
    </div>
  );
}
