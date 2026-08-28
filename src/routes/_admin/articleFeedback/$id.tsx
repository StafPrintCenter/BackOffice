import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, FileText, Calendar, MessageSquare } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminArticleFeedbackDetail, useDeleteAdminArticleFeedback } from "@/stores/useArticleFeedbackStore";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/$id")({
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
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/articleFeedback" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        {feedback && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setToDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !feedback ? (
        <p className="text-muted-foreground">Retour introuvable.</p>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <code className="text-sm font-semibold">{feedback.articleKey}</code>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(feedback.vote)}`}>
                {getArticleFeedbackVoteLabel(feedback.vote)}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> Commentaire
              </div>
              <div className="mt-1 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {feedback.comment || "Aucun commentaire laissé."}
              </div>
            </div>

            <div className="mt-6 border-t pt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Reçu le {formatDate(feedback.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Modifié le {formatDate(feedback.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          if (!feedback) return;
          removeMutation.mutate(feedback.id, {
            onSuccess: () => {
              toast.success("Retour supprimé");
              navigate({ to: "/articleFeedback" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer ce retour sur "${feedback?.articleKey}" ?`}
      />
    </>
  );
}