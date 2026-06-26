import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Pencil, Quote, Star } from 'lucide-react';
import { api, type TestimonialInput, type SiteAccentValue } from '@/lib/api';
import type { TestimonialDto } from '@carrymate/shared';
import { Panel, Labelled, TextInput, TextArea, AccentField, ActiveToggle, accentDot, PageHead } from '@/components/cms';

const EMPTY: TestimonialInput = { quote: '', name: '', role: '', rating: 5, accent: 'gold', sortOrder: 0, active: true };

export function Testimonials() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cms-testimonials'], queryFn: api.testimonials });
  const [editing, setEditing] = useState<TestimonialDto | null>(null);
  const [draft, setDraft] = useState<TestimonialInput | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['cms-testimonials'] });
  const onErr = (e: unknown) => window.alert((e as Error).message);

  const save = useMutation({
    mutationFn: () =>
      editing ? api.updateTestimonial(editing.id, draft!) : api.createTestimonial(draft!),
    onSuccess: () => {
      setDraft(null);
      setEditing(null);
      invalidate();
    },
    onError: onErr,
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => api.updateTestimonial(id, { active }),
    onSettled: invalidate,
    onError: onErr,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteTestimonial(id),
    onSettled: invalidate,
    onError: onErr,
  });

  const openNew = () => {
    setEditing(null);
    setDraft({ ...EMPTY, sortOrder: data?.length ?? 0 });
  };
  const openEdit = (t: TestimonialDto) => {
    setEditing(t);
    setDraft({ quote: t.quote, name: t.name, role: t.role, rating: t.rating, accent: t.accent, sortOrder: t.sortOrder, active: t.active });
  };

  return (
    <div className="space-y-6">
      <PageHead
        title="Testimonials"
        desc="Quotes shown on the marketing site. Reorder with the position field; hide without deleting using the toggle."
        action={
          <button onClick={openNew} className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> Add testimonial
          </button>
        }
      />

      {isLoading && <Loading />}

      <div className="grid gap-3">
        {data?.map((t) => (
          <div key={t.id} className={`rounded-xl border bg-card p-5 shadow-sm ${t.active ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${accentDot(t.accent)}`} />
              <div className="flex-1">
                <Quote className="h-4 w-4 text-muted-foreground" />
                <p className="mt-1 text-sm leading-relaxed text-foreground">{t.quote}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.name}</span>
                  <span>· {t.role}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </span>
                  <span className="ml-auto font-mono">#{t.sortOrder}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <ActiveToggle active={t.active} busy={toggle.isPending} onToggle={(active) => toggle.mutate({ id: t.id, active })} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-md border p-1.5 text-muted-foreground hover:bg-accent" aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => window.confirm('Delete this testimonial?') && remove.mutate(t.id)}
                    className="rounded-md border p-1.5 text-red-600 hover:bg-red-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {data && data.length === 0 && <Empty />}
      </div>

      <Panel
        open={draft !== null}
        title={editing ? 'Edit testimonial' : 'New testimonial'}
        onClose={() => setDraft(null)}
        footer={
          <>
            <button onClick={() => setDraft(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !draft?.quote || !draft?.name}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
            </button>
          </>
        }
      >
        {draft && (
          <>
            <Labelled label="Quote">
              <TextArea rows={4} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} />
            </Labelled>
            <Labelled label="Name">
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Sana K." />
            </Labelled>
            <Labelled label="Role / context">
              <TextInput value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Traveler · 31 deliveries" />
            </Labelled>
            <div className="grid grid-cols-2 gap-3">
              <Labelled label="Rating (1–5)">
                <TextInput type="number" min={1} max={5} value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })} />
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

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}
function Empty() {
  return (
    <div className="rounded-xl border border-dashed bg-card py-16 text-center text-sm text-muted-foreground">
      No testimonials yet. Add one to show it on the site.
    </div>
  );
}
