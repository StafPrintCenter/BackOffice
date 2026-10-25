import { MessageSquare, Calendar } from "lucide-react";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function FeedbackGroupItemsList({ feedbacks }: { feedbacks: APIAdminArticleFeedback[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 font-display text-base font-semibold">
          <MessageSquare className="h-4 w-4 text-primary" /> Retours individuels ({feedbacks.length})
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          Aucun retour individuel enregistré.
        </p>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border bg-background/60 p-4 text-sm transition-colors hover:border-border/80"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getArticleFeedbackVoteBadge(f.vote)}`}>
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
  );
}