import { ThumbsUp, Clock, Calendar } from "lucide-react";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function FeedbackUniqueSidebarVote({ feedback }: { feedback: APIAdminArticleFeedback }) {
  return (
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
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(feedback.vote)}`}>
            {feedback.vote}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FeedbackUniqueSidebarTimestamp({ feedback }: { feedback: APIAdminArticleFeedback }) {
  return (
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
  );
}