export type ReviewPublicationStatus = "pending" | "approved" | "rejected" | "hidden" | "featured" | string;

export type APIAdminReviewResponseListItem = {
  id: string;
  reviewInvitationId: string;
  reviewFormId: string;
  reviewForm: string;
  projectId: string | null;
  projectName: string | null;
  project: string | null;
  clientName: string;
  answers: Record<string, string>;
  clientEmail: string;
  allowPublication: boolean;
  publicationStatus: ReviewPublicationStatus;
  submittedAt: string;
};

export type APIAdminReviewResponseDetail = APIAdminReviewResponseListItem & {
  answers: Record<string, unknown>;
};

export interface AdminReviewResponsePublicationPayload {
  publication_status: ReviewPublicationStatus;
}

export const REVIEW_PUBLICATION_STATUS_BADGES: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  hidden: "bg-muted text-muted-foreground border-border",
  featured: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export const REVIEW_PUBLICATION_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
  hidden: "Masquée",
  featured: "Mise en avant",
};