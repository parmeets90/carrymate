import { Construction } from 'lucide-react';

/** Generic "coming in a later phase" screen for not-yet-built admin sections. */
export function Placeholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">This section is built in {phase}.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
        <Construction className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium">{title} — coming soon</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Scheduled for {phase}. The dashboard and navigation shell are ready now.
        </p>
      </div>
    </div>
  );
}
