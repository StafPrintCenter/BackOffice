export type InternshipRequestStatus = "pending" | "under_review" | "additional_info_requested" | "accepted" | "rejected";
export type InternshipRequestManualStatus = "pending" | "under_review";

export type APIAdminInternshipRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string | null;
  fieldOfStudy: string | null;
  desiredStartDate: string | null;
  duration: string | null;
  message: string | null;
  cvUrl: string | null;
  status: InternshipRequestStatus;
  infoRequestedMessage: string | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export interface AdminInternshipRequestStatusPayload {
  status: InternshipRequestManualStatus;
  admin_notes?: string;
}

export interface AdminInternshipRequestInfoPayload {
  message: string;
}

export const INTERNSHIP_REQUEST_STATUS_LABELS: Record<InternshipRequestStatus, string> = {
  pending: "En attente",
  under_review: "En cours d'examen",
  additional_info_requested: "Infos complémentaires demandées",
  accepted: "Acceptée",
  rejected: "Rejetée",
};

export const INTERNSHIP_REQUEST_STATUS_BADGES: Record<InternshipRequestStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  under_review: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  additional_info_requested: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function getInternshipRequestStatusBadge(status: InternshipRequestStatus): string {
  return INTERNSHIP_REQUEST_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}