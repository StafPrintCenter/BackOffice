import type { ReactNode } from "react";

export function StatCard({ label, value, icon, hint }: { label: string; value: string | number; icon: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-elegant">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      </div>
    </div>
  );
}
