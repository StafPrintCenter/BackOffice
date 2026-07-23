export type ReviewInvitationStatus = "pending" | "opened" | "completed" | "expired" | "revoked" | string;

export type APIAdminReviewInvitation = {
  id: string;
  token: string;
  link: string;
  projectId: string | null;
  projectName: string | null;
  project: string | null;
  reviewFormId: string;
  reviewForm: string;
  clientName: string;
  clientEmail: string;
  maxResponses: number;
  responsesCount: number;
  status: ReviewInvitationStatus;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
};

export interface AdminReviewInvitationPayload {
  review_form_id: string;
  project_id?: string;
  project_name?: string;
  client_name: string;
  client_email: string;
  max_responses?: number;
  expires_at?: string; // ISO 8601
}

export const REVIEW_INVITATION_STATUS_BADGES: Record<string, string> = {
  pending: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  opened: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  expired: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  revoked: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export const REVIEW_INVITATION_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  opened: "Ouverte",
  completed: "Complétée",
  expired: "Expirée",
  revoked: "Révoquée",
};