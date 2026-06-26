import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { SiteAccentValue } from '@/lib/api';

/** Slide-over editor panel used by every CMS page. */
export function Panel({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="flex w-full max-w-md flex-col border-l bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

export function Labelled({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-9 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

const ACCENTS: { value: SiteAccentValue; label: string; cls: string }[] = [
  { value: 'gold', label: 'Gold · trust', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'mint', label: 'Mint · money', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'sky', label: 'Sky · info', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'ember', label: 'Ember · warmth', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
];

export function AccentField({
  value,
  onChange,
}: {
  value: SiteAccentValue;
  onChange: (v: SiteAccentValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ACCENTS.map((a) => (
        <button
          key={a.value}
          type="button"
          onClick={() => onChange(a.value)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            value === a.value ? a.cls + ' ring-2 ring-offset-1 ring-primary/40' : 'border-border text-muted-foreground'
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

export function accentDot(accent: string) {
  const map: Record<string, string> = {
    gold: 'bg-amber-400',
    mint: 'bg-emerald-400',
    sky: 'bg-blue-400',
    ember: 'bg-orange-400',
  };
  return map[accent] ?? 'bg-gray-300';
}

/** Pill toggle for the `active` flag, used inline in lists. */
export function ActiveToggle({
  active,
  busy,
  onToggle,
}: {
  active: boolean;
  busy?: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!active)}
      disabled={busy}
      className={`relative h-5 w-9 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
      aria-label={active ? 'Visible — click to hide' : 'Hidden — click to show'}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${active ? 'left-[18px]' : 'left-0.5'}`}
      />
    </button>
  );
}

export function PageHead({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}
