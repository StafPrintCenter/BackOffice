export type JobApplicationStatus = "pending" | "reviewing" | "shortlisted" | "accepted" | "rejected";

// ⚠️ Seuls pending/reviewing/shortlisted sont acceptés via l'update de statut classique.
// accepted/rejected ne sont atteignables que via les actions dédiées /accept et /reject.
export type JobApplicationManualStatus = "pending" | "reviewing" | "shortlisted";

export type APIAdminJobApplication = {
  id: string;
  jobOfferId: string;
  jobOffer: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  educationLevel: string;
  coverLetter: string | null;
  cvUrl: string;
  coverLetterFileUrl: string | null;
  status: JobApplicationStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface AdminJobApplicationStatusPayload {
  status: JobApplicationManualStatus;
  admin_notes?: string;
}

export const JOB_APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  pending: "En attente",
  reviewing: "En cours d'examen",
  shortlisted: "Présélectionné",
  accepted: "Accepté",
  rejected: "Rejeté",
};

export const JOB_APPLICATION_STATUS_BADGES: Record<JobApplicationStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  reviewing: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  shortlisted: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function getJobApplicationStatusBadge(status: JobApplicationStatus): string {
  return JOB_APPLICATION_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}