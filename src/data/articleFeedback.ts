export type ArticleFeedbackVote = "up" | "down";

export const ARTICLE_FEEDBACK_VOTE_LABELS: Record<ArticleFeedbackVote, string> = {
  up: "Positif",
  down: "Négatif",
};

export const ARTICLE_FEEDBACK_VOTE_BADGES: Record<ArticleFeedbackVote, string> = {
  up: "bg-emerald-500/10 text-emerald-600",
  down: "bg-destructive/10 text-destructive",
};

export function getArticleFeedbackVoteBadge(vote: ArticleFeedbackVote): string {
  return ARTICLE_FEEDBACK_VOTE_BADGES[vote] ?? "bg-muted text-muted-foreground";
}

export function getArticleFeedbackVoteLabel(vote: ArticleFeedbackVote): string {
  return ARTICLE_FEEDBACK_VOTE_LABELS[vote] ?? vote;
}

// Liste et détail renvoient les mêmes champs → un seul type.
export type APIAdminArticleFeedback = {
  id: string;
  articleKey: string;
  vote: ArticleFeedbackVote;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface APIAdminArticleFeedbackGroup {
  articleKey: string;
  positiveVotes: number;
  negativeVotes: number;
  totalVotes: number;
}