import { CheckCircle2, Circle } from "lucide-react";
import type { APIAdminHealthItem, AdminHealthCategory } from "@/data/profileHealth";

const CATEGORIES: { key: AdminHealthCategory; label: string }[] = [
  { key: "security", label: "Sécurité" },
  { key: "profile", label: "Profil" },
];

export function HealthChecklist({ items }: { items: APIAdminHealthItem[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="mb-4 border-b pb-3 font-display text-lg font-semibold">Détail du score</h3>

      <div className="space-y-5">
        {CATEGORIES.map(({ key, label }) => {
          const rows = items.filter((i) => i.category === key);
          if (rows.length === 0) return null;

          return (
            <div key={key}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
              <ul className="space-y-2">
                {rows.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className={item.done ? "" : "text-muted-foreground"}>{item.label}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.done ? "" : "+"}{item.points} pts
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}