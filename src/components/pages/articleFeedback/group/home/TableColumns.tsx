import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

type FeedbackGroupRow = APIAdminArticleFeedbackGroup & { id: string };

export function getFeedbackGroupColumns() {
  return [
    {
      key: "articleKey" as keyof FeedbackGroupRow,
      label: "Article",
      render: (r: FeedbackGroupRow) => <code className="text-xs font-medium">{r.articleKey}</code>,
    },
    {
      key: "positiveVotes" as keyof FeedbackGroupRow,
      label: "Positifs",
      render: (r: FeedbackGroupRow) => <span className="text-emerald-600 font-medium">{r.positiveVotes}</span>,
    },
    {
      key: "negativeVotes" as keyof FeedbackGroupRow,
      label: "Négatifs",
      render: (r: FeedbackGroupRow) => <span className="text-destructive font-medium">{r.negativeVotes}</span>,
    },
    {
      key: "totalVotes" as keyof FeedbackGroupRow,
      label: "Total",
      render: (r: FeedbackGroupRow) => <span className="font-semibold">{r.totalVotes}</span>,
    },
    {
      key: "commentsCount" as keyof FeedbackGroupRow,
      label: "Commentaires",
      render: (r: FeedbackGroupRow) => <span className="text-xs text-muted-foreground">{r.commentsCount}</span>,
    },
    {
      key: "satisfactionRate" as keyof FeedbackGroupRow,
      label: "Satisfaction",
      render: (r: FeedbackGroupRow) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.satisfactionRate >= 50 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
          {r.satisfactionRate}%
        </span>
      ),
    },
    {
      key: "lastFeedbackAt" as keyof FeedbackGroupRow,
      label: "Dernier retour",
      render: (r: FeedbackGroupRow) => <span className="text-xs text-muted-foreground">{formatDate(r.lastFeedbackAt)}</span>,
    },
  ];
}