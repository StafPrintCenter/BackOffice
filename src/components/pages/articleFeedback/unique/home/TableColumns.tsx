import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function getFeedbackUniqueColumns() {
  return [
    {
      key: "articleKey" as keyof APIAdminArticleFeedback,
      label: "Article",
      render: (r: APIAdminArticleFeedback) => <code className="text-xs font-medium">{r.articleKey}</code>,
    },
    {
      key: "vote" as keyof APIAdminArticleFeedback,
      label: "Vote",
      render: (r: APIAdminArticleFeedback) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(r.vote)}`}>
          {getArticleFeedbackVoteLabel(r.vote)}
        </span>
      ),
    },
    {
      key: "comment" as keyof APIAdminArticleFeedback,
      label: "Commentaire",
      render: (r: APIAdminArticleFeedback) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{r.comment || "-"}</span>,
    },
    {
      key: "createdAt" as keyof APIAdminArticleFeedback,
      label: "Reçu le",
      render: (r: APIAdminArticleFeedback) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
  ];
}