import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  FileText,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  MessageSquare,
  Calendar,
  Percent,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminArticleFeedbackGroupDetail } from "@/stores/useArticleFeedbackStore";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/group/$articleKey")({
  head: () => ({
    meta: [
      { title: `Retours sur article | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticleFeedbackGroupDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function ArticleFeedbackGroupDetail() {
  const { articleKey: encodedKey } = Route.useParams();
  const articleKey = decodeURIComponent(encodedKey);
  const navigate = useNavigate();
  const { item: group, isLoading } = useAdminArticleFeedbackGroupDetail(articleKey);

  return (
    <div className="space-y-6">
      {/* En-tête & Bouton retour */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/articleFeedback/group" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>

          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {group?.articleKey ?? articleKey}
            </h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Chargement des données du groupe...</p>
        </div>
      ) : !group ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          <p>Aucun retour trouvé pour cet article.</p>
        </div>
      ) : (
        /* Layout à 2 Colonnes */
        <div className="grid gap-6 lg:grid-cols-12 items-start">

          {/* COLONNE GAUCHE (Contenu principal - 8 Colonnes) */}
          <div className="space-y-6 lg:col-span-8">
            {/* Visualiseur du taux de satisfaction & barre de répartition */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Score global de satisfaction
                </div>
                <span className="text-2xl font-black text-foreground">
                  {group.satisfactionRate}%
                </span>
              </div>

              {/* Barre de répartition issue de positiveRate et negativeRate de l'API */}
              <div className="space-y-2">
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${group.positiveRate}%` }}
                  />
                  <div
                    className="h-full bg-destructive transition-all duration-500"
                    style={{ width: `${group.negativeRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ThumbsUp className="h-3 w-3" /> {group.positiveVotes} Utiles ({group.positiveRate}%)
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <ThumbsDown className="h-3 w-3" /> {group.negativeVotes} Pas utiles ({group.negativeRate}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des feedbacks individuels */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 font-display text-base font-semibold">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Retours individuels ({group.feedbacks.length})
                </div>
              </div>

              {group.feedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Aucun retour individuel enregistré.
                </p>
              ) : (
                <div className="space-y-3">
                  {group.feedbacks.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border bg-background/60 p-4 text-sm transition-colors hover:border-border/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getArticleFeedbackVoteBadge(
                            f.vote
                          )}`}
                        >
                          {getArticleFeedbackVoteLabel(f.vote)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(f.createdAt)}
                        </span>
                      </div>

                      {f.comment ? (
                        <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap border border-border/40">
                          {f.comment}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs italic text-muted-foreground/50">
                          Aucun commentaire fourni
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE (Sidebar Métriques - 4 Colonnes) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Grille des indicateurs KPI */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
              <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Statistiques API
              </h2>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {/* Total votes */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Total votes</span>
                  </div>
                  <span className="text-lg font-bold">{group.totalVotes}</span>
                </div>

                {/* Votes positifs */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                      <ThumbsUp className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Votes positifs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {group.positiveVotes}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {group.positiveRate}%
                    </span>
                  </div>
                </div>

                {/* Votes négatifs */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                      <ThumbsDown className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Votes négatifs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-destructive">
                      {group.negativeVotes}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {group.negativeRate}%
                    </span>
                  </div>
                </div>

                {/* Commentaires */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Commentaires</span>
                  </div>
                  <span className="text-lg font-bold">{group.commentsCount}</span>
                </div>

                {/* Ratio Up/Down */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                      <Scale className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Ratio (+/-)</span>
                  </div>
                  <span className="text-lg font-bold">
                    {group.upDownRatio != null ? group.upDownRatio : "—"}
                  </span>
                </div>

                {/* Taux de satisfaction */}
                <div className="flex items-center justify-between rounded-xl border bg-background/50 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                      <Percent className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Satisfaction</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {group.satisfactionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Méta-données d'horodatage */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
              <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horodatage
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex flex-col gap-0.5 rounded-lg bg-background/50 p-3 border">
                  <span className="text-muted-foreground font-medium">Premier retour</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(group.firstFeedbackAt)}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 rounded-lg bg-background/50 p-3 border">
                  <span className="text-muted-foreground font-medium">Dernier retour</span>
                  <span className="font-semibold text-foreground">
                    {formatDate(group.lastFeedbackAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}