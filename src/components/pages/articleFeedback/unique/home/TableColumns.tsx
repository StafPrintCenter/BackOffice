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
      render: (r: APIAdminArticleFeedback) => (
        <div className="max-w-30 sm:max-w-50 truncate">
          <code className="text-xs font-medium truncate block" title={r.articleKey}>
            {r.articleKey}
          </code>
        </div>
      ),
    },
    {
      key: "vote" as keyof APIAdminArticleFeedback,
      label: "Vote",
      render: (r: APIAdminArticleFeedback) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getArticleFeedbackVoteBadge(r.vote)}`}>
          {getArticleFeedbackVoteLabel(r.vote)}
        </span>
      ),
    },
    {
      key: "comment" as keyof APIAdminArticleFeedback,
      label: "Commentaire",
      render: (r: APIAdminArticleFeedback) => (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-37.5 sm:max-w-xs">
          {r.comment || "-"}
        </span>
      ),
    },
    {
      key: "createdAt" as keyof APIAdminArticleFeedback,
      label: "Reçu le",
      render: (r: APIAdminArticleFeedback) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
  ];
}