import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  Flag,
  Gavel,
  Loader2,
  MessageSquareText,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { AuthorRoleBadge } from "@/components/pages/community/shared";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/data/community";
import { RESOLUTION_LABELS } from "@/data/communityAdmin";
import { useReportDetail } from "@/stores/useCommunityAdminStore";
import {
  EscalatedBadge,
  ReportLevelBadge,
  ReportReasonBadge,
  ReportStatusBadge,
  TargetTypeBadge,
} from "./ReportBadges";
import { ReportTarget } from "./ReportTarget";
import { ResolveReportDialog } from "./ResolveReportDialog";

export function ReportDetailPage({ reportId }: { reportId: string }) {
  const { report, isLoading, isError } = useReportDetail(reportId);
  const [resolveOpen, setResolveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm">Chargement du signalement…</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <Link to="/community/reports">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour aux signalements
          </Link>
        </Button>
        <div className="rounded-2xl border bg-card px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Flag className="h-5 w-5" />
          </div>
          <h1 className="font-display text-lg font-semibold">
            {isError ? "Impossible de charger ce signalement" : "Signalement introuvable"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isError
              ? "Une erreur est survenue pendant le chargement. Réessayez depuis la liste."
              : "Ce signalement n’existe pas ou n’est plus disponible."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-3 text-muted-foreground">
          <Link to="/community/reports">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour aux signalements
          </Link>
        </Button>
      </div>

      <section className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ReportStatusBadge status={report.status} />
                <ReportReasonBadge reason={report.reason} />
                <TargetTypeBadge type={report.target.type} />
                <ReportLevelBadge level={report.level} />
                {report.escalation != null && <EscalatedBadge />}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Modération de la communauté
                </p>
                <h1 className="mt-1 break-all font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Signalement <span className="text-muted-foreground">#{report.id}</span>
                </h1>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-3 md:items-end">
            <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>
                Reçu le{" "}
                <b className="font-semibold text-foreground">{formatPostDate(report.reportedAt)}</b>
              </span>
            </div>
            {report.status === "pending" && (
              <Button className="w-full md:w-auto" onClick={() => setResolveOpen(true)}>
                <Gavel className="mr-1.5 h-4 w-4" /> Traiter le signalement
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display font-semibold">Contenu signalé</h2>
                <p className="text-xs text-muted-foreground">
                  {report.target.type === "comment"
                    ? "Commentaire de la communauté"
                    : "Publication de la communauté"}
                </p>
              </div>
            </div>
            <ReportTarget target={report.target} full />
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Flag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display font-semibold">Motif du signalement</h2>
                <p className="text-xs text-muted-foreground">
                  Informations communiquées par le membre
                </p>
              </div>
            </div>
            {report.details ? (
              <blockquote className="border-l-2 border-amber-500/50 pl-4 text-sm leading-relaxed text-foreground">
                {report.details}
              </blockquote>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Aucun détail complémentaire n’a été fourni.
              </p>
            )}
          </section>

          {report.resolution && (
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div className="space-y-1">
                  <h2 className="font-display font-semibold text-emerald-800 dark:text-emerald-400">
                    {RESOLUTION_LABELS[report.resolution.action] ?? report.resolution.action}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {report.resolution.by && (
                      <>
                        Traité par{" "}
                        <b className="font-medium text-foreground">{report.resolution.by.name}</b>{" "}
                        ·{" "}
                      </>
                    )}
                    {formatPostDate(report.resolution.at)}
                  </p>
                  {report.resolution.note && (
                    <p className="pt-2 text-sm text-foreground">{report.resolution.note}</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <h2 className="font-display font-semibold">Résumé</h2>
            <dl className="mt-4 divide-y">
              <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
                <dt className="text-sm text-muted-foreground">Statut</dt>
                <dd>
                  <ReportStatusBadge status={report.status} />
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Niveau</dt>
                <dd className="text-right text-sm font-medium">
                  {report.level === "admin" ? "Administrateur" : "Formateurs"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-sm text-muted-foreground">Type de contenu</dt>
                <dd className="text-right text-sm font-medium">
                  {report.target.type === "comment" ? "Commentaire" : "Publication"}
                </dd>
              </div>
              {typeof report.reportsOnTarget === "number" && (
                <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
                  <dt className="text-sm text-muted-foreground">Signalements sur ce contenu</dt>
                  <dd className="text-sm font-semibold tabular-nums">{report.reportsOnTarget}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <UserRound className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display font-semibold">Signalé par</h2>
                <p className="text-xs text-muted-foreground">Auteur du signalement</p>
              </div>
            </div>
            {report.reporter ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-3">
                <span className="text-sm font-semibold">{report.reporter.name}</span>
                <AuthorRoleBadge role={report.reporter.role} />
              </div>
            ) : (
              <p className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                Membre non identifié
              </p>
            )}
          </section>
        </aside>
      </div>

      {report.status === "pending" && (
        <ResolveReportDialog report={report} open={resolveOpen} onOpenChange={setResolveOpen} />
      )}
    </div>
  );
}
