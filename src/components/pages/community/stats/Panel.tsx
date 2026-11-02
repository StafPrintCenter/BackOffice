import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AUTHOR_ROLE_LABELS, type AuthorRole } from "@/data/community";
import { useCommunityStats } from "@/stores/useCommunityAdminStore";

const Card = ({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: string }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`mt-1 font-display text-2xl font-bold ${tone ?? ""}`}>{value}</div>
    {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
  </div>
);

const roles = (m: Partial<Record<AuthorRole, number>>) =>
  (Object.keys(AUTHOR_ROLE_LABELS) as AuthorRole[]).map((r) => `${AUTHOR_ROLE_LABELS[r]} ${m[r] ?? 0}`).join(" · ");

export function CommunityStatsPanel() {
  const [days, setDays] = useState(30);
  const { stats: s, isLoading, isError } = useCommunityStats(days);

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Chiffres clés</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-8 cursor-pointer rounded-md border border-input bg-background px-2 text-xs">
          {[7, 30, 90, 365].map((d) =>
            <option key={d} value={d}>{d} derniers jours</option>)}
        </select>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p>
        : isError || !s ? <p className="text-sm text-destructive">Statistiques indisponibles.</p>
          : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card label="À traiter (admin)" value={s.reports.pendingAdmin} tone={s.reports.pendingAdmin > 0 ? "text-amber-600" : ""} />
                <Card label="En cours chez les formateurs" value={s.reports.pendingInstructor} />
                <Card label="Signalements traités" value={s.reports.resolved} />
                <Card label="Signalements rejetés" value={s.reports.dismissed} />
                <Card label="Publications" value={s.period.posts} hint={`${s.totals.posts} au total · ${roles(s.period.postsByRole)}`} />
                <Card label="Commentaires" value={s.period.comments} hint={`${s.totals.comments} au total · ${roles(s.period.commentsByRole)}`} />
                <Card label="Réactions" value={s.period.reactions} hint={`${s.totals.reactions} au total`} />
                <Card label="Contenus masqués" value={s.totals.hiddenPosts + s.totals.hiddenComments} hint={`${s.totals.hiddenPosts} publ. · ${s.totals.hiddenComments} comm.`} />
              </div>

              {s.topPosts.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">Publications les plus actives</h3>
                  <ul className="space-y-1.5 text-sm">
                    {s.topPosts.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3">
                        <Link to="/community/posts/$id" params={{ id: p.id }} className="truncate text-primary hover:underline">{p.title}</Link>
                        <span className="shrink-0 text-xs text-muted-foreground">{p.commentsCount} comm. · {p.reactionsCount} réact.</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
    </section>
  );
}