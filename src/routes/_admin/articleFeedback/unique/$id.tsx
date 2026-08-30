import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, FileText, Calendar, MessageSquare, Clock, ShieldAlert, ThumbsUp } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminArticleFeedbackDetail, useDeleteAdminArticleFeedback } from "@/stores/useArticleFeedbackStore";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/unique/$id")({
  head: () => ({
    meta: [
      { title: `Retour sur article | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticleFeedbackDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function ArticleFeedbackDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: feedback, isLoading } = useAdminArticleFeedbackDetail(id);
  const removeMutation = useDeleteAdminArticleFeedback();

  const [toDelete, setToDelete] = useState(false);

  return (
    <>
      <div className="space-y-6">
        {/* En-tête de navigation & actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/articleFeedback/unique" })}>
            <ArrowLeft className="mr-1.5 size-4" /> Retour à la liste
          </Button>

          {feedback && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setToDelete(true)}
            >
              <Trash2 className="mr-1.5 size-4" /> Supprimer
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="mb-2 size-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Chargement du retour...</p>
          </div>
        ) : !feedback ? (
          <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
            <ShieldAlert className="mx-auto size-10 text-muted-foreground/60" />
            <h2 className="mt-3 text-lg font-semibold">Retour introuvable</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Le retour d'expérience demandé n'existe pas ou a été supprimé.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ to: "/articleFeedback/unique" })}>
              Retourner à la liste
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Colonne Principale (2/3 de l'écran sur desktop) */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Article ciblé
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <FileText className="size-5 text-primary shrink-0" />
                      <code className="rounded bg-muted px-2 py-0.5 text-base font-bold font-mono text-foreground break-all">
                        {feedback.articleKey}
                      </code>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getArticleFeedbackVoteBadge(
                      feedback.vote
                    )}`}
                  >
                    {getArticleFeedbackVoteLabel(feedback.vote)}
                  </span>
                </div>

                {/* Section Commentaire */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MessageSquare className="size-4 text-primary" /> Commentaire de l'utilisateur
                  </div>
                  <div className="mt-3 rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {feedback.comment ? (
                      feedback.comment
                    ) : (
                      <span className="italic text-muted-foreground">Aucun commentaire écrit fourni avec ce vote.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Secondaire (1/3 de l'écran sur desktop) */}
            <div className="space-y-6">
              {/* Carte Avis / Vote */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ThumbsUp className="size-4 text-primary" /> Évaluation
                </div>

                <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Avis soumis
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {getArticleFeedbackVoteLabel(feedback.vote)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(
                        feedback.vote
                      )}`}
                    >
                      {feedback.vote}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carte Horodatage */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="size-4 text-primary" /> Horodatage
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="block font-medium text-foreground">Date de réception</span>
                      <span className="text-muted-foreground">{formatDate(feedback.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-t pt-3">
                    <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="block font-medium text-foreground">Dernière mise à jour</span>
                      <span className="text-muted-foreground">{formatDate(feedback.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <ConfirmDelete
          open={toDelete}
          onOpenChange={setToDelete}
          onConfirm={() => {
            removeMutation.mutate(feedback.id, {
              onSuccess: () => {
                toast.success("Retour supprimé");
                navigate({ to: "/articleFeedback/unique" });
              },
              onError: () => toast.error("Erreur lors de la suppression"),
            });
          }}
          title={`Supprimer le retour sur "${feedback.articleKey}" ?`}
        />
      )}
    </>
  );
}