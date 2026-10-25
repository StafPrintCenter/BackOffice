import { FileText, MessageSquare } from "lucide-react";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";

interface MainCardProps {
  feedback: APIAdminArticleFeedback;
}

export function FeedbackUniqueMainCard({ feedback }: MainCardProps) {
  return (
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

        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getArticleFeedbackVoteBadge(feedback.vote)}`}>
          {getArticleFeedbackVoteLabel(feedback.vote)}
        </span>
      </div>

      <div className="mt-6 border-t pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquare className="size-4 text-primary" /> Commentaire de l'utilisateur
        </div>
        <div className="mt-3 rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {feedback.comment ? feedback.comment : <span className="italic text-muted-foreground">Aucun commentaire écrit fourni avec ce vote.</span>}
        </div>
      </div>
    </div>
  );
}