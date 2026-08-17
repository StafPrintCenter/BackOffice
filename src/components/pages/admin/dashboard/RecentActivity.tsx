import { Activity, MessagesSquare, Star, LucideIcon } from "lucide-react";

export interface RecentItem {
  type: string;
  title: string;
  meta: string;
  icon: LucideIcon;
}

interface DashboardRecentActivityProps {
  recent: RecentItem[];
  testimonials: any[];
  testimonialsLoading: boolean;
  avgRating: string;
}

export function DashboardRecentActivity({
  recent,
  testimonials,
  testimonialsLoading,
  avgRating,
}: DashboardRecentActivityProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      {/* Activité récente */}
      <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <div className="font-display text-lg font-semibold">Activité récente</div>
        </div>
        <ul className="mt-4 divide-y">
          {recent.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.meta}</div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {r.type}
                </span>
              </li>
            );
          })}
          {recent.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">Aucune activité</li>
          )}
        </ul>
      </div>

      {/* Témoignages */}
      <div className="rounded-2xl border bg-card p-6 shadow-elegant">
        <div className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4 text-primary" />
          <div className="font-display text-lg font-semibold">Derniers témoignages</div>
        </div>
        <div className="text-xs text-muted-foreground">{avgRating} / 5 de moyenne</div>
        <ul className="mt-4 space-y-4">
          {testimonialsLoading && (
            <li className="text-center text-sm text-muted-foreground">Chargement...</li>
          )}
          {[...testimonials]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map((t) => (
              <li key={t.id} className="rounded-xl border p-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-2 text-xs italic line-clamp-3">"{t.quote}"</p>
                <div className="mt-2 text-xs font-medium">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.role}</div>
              </li>
            ))}
          {!testimonialsLoading && testimonials.length === 0 && (
            <li className="text-center text-sm text-muted-foreground">Aucun témoignage</li>
          )}
        </ul>
      </div>
    </div>
  );
}