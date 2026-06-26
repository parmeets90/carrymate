import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import type { SiteSettingsDto } from '@carrymate/shared';
import { Labelled, TextInput, PageHead } from '@/components/cms';

const FIELDS: { key: keyof SiteSettingsDto; label: string; placeholder: string; hint?: string }[] = [
  { key: 'brandName', label: 'Brand name', placeholder: 'CarryMate' },
  { key: 'tagline', label: 'Tagline / footer line', placeholder: 'A peer-to-peer way to send the things that matter…' },
  { key: 'contactEmail', label: 'Contact email', placeholder: 'hello@carrymate.app' },
  { key: 'supportEmail', label: 'Support email', placeholder: 'support@carrymate.app' },
  { key: 'contactPhone', label: 'Contact phone', placeholder: '+91…' },
  { key: 'twitterUrl', label: 'X / Twitter URL', placeholder: 'https://x.com/…' },
  { key: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/…' },
  { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/…' },
  { key: 'appStoreUrl', label: 'App Store URL', placeholder: 'https://apps.apple.com/…' },
  { key: 'playStoreUrl', label: 'Google Play URL', placeholder: 'https://play.google.com/…' },
];

export function Branding() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['cms-settings'], queryFn: api.siteSettings });
  const [form, setForm] = useState<SiteSettingsDto | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.updateSiteSettings(form!),
    onSuccess: (next) => {
      qc.setQueryData(['cms-settings'], next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: (e) => window.alert((e as Error).message),
  });

  return (
    <div className="space-y-6">
      <PageHead
        title="Branding & Contact"
        desc="Global details used across the marketing site — footer tagline, contact methods, social links and app-store buttons."
      />

      {isLoading || !form ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.key === 'tagline' ? 'sm:col-span-2' : ''}>
                <Labelled label={f.label} hint={f.hint}>
                  <TextInput
                    value={form[f.key]}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </Labelled>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t pt-5">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
