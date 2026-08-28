import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Loader2, FileText, ThumbsUp, ThumbsDown, BarChart3, MessageSquare,
  Calendar, Percent, Scale,
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
    <>
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/articleFeedback/group" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !group ? (
        <p className="text-muted-foreground">Aucun retour trouvé pour cet article.</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          {/* En-tête + statistiques */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="font-display text-xl font-bold">{group.articleKey}</h1>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <ThumbsUp className="h-4 w-4 text-emerald-600" /> Votes positifs
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{group.positiveVotes}</div>
                <div className="text-xs text-muted-foreground">{group.positiveRate}% des votes</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <ThumbsDown className="h-4 w-4 text-destructive" /> Votes négatifs
                </div>
                <div className="mt-1 text-2xl font-bold text-destructive">{group.negativeVotes}</div>
                <div className="text-xs text-muted-foreground">{group.negativeRate}% des votes</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <BarChart3 className="h-4 w-4 text-primary" /> Total des votes
                </div>
                <div className="mt-1 text-2xl font-bold">{group.totalVotes}</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <MessageSquare className="h-4 w-4 text-sky-600" /> Commentaires
                </div>
                <div className="mt-1 text-2xl font-bold">{group.commentsCount}</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Scale className="h-4 w-4 text-amber-600" /> Ratio positif/négatif
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {group.upDownRatio != null ? group.upDownRatio : "—"}
                </div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Percent className="h-4 w-4 text-primary" /> Taux de satisfaction
                </div>
                <div className="mt-1 text-2xl font-bold">{group.satisfactionRate}%</div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="text-xs font-medium text-muted-foreground">Satisfaction (fournie par l'API)</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${group.satisfactionRate >= 50 ? "bg-emerald-500" : "bg-destructive"}`}
                  style={{ width: `${group.satisfactionRate}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Premier retour : {formatDate(group.firstFeedbackAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Dernier retour : {formatDate(group.lastFeedbackAt)}
              </span>
            </div>
          </div>

          {/* Liste des feedbacks individuels */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-primary" /> Retours individuels ({group.feedbacks.length})
            </div>
            {group.feedbacks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun retour individuel.</p>
            ) : (
              <div className="space-y-2">
                {group.feedbacks.map((f) => (
                  <div key={f.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(f.vote)}`}>
                        {getArticleFeedbackVoteLabel(f.vote)}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(f.createdAt)}</span>
                    </div>
                    {f.comment && (
                      <p className="mt-2 rounded-lg bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap">{f.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}