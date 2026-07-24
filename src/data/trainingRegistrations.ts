export type TrainingRegistrationStatus = "pending" | "contacted" | "accepted" | "cancelled";

export type APIAdminTrainingRegistration = {
  id: string;
  trainingId: string;
  training: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  schedulePreference: string | null;
  notes: string | null;
  programRead: boolean;
  status: TrainingRegistrationStatus;
  studentId: string | null;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export interface AdminTrainingRegistrationStatusPayload {
  status: TrainingRegistrationStatus;
  admin_notes?: string;
}

/**
 * Helpers d'affichage du statut d'inscription
 */
export const STATUS_LABELS: Record<TrainingRegistrationStatus, string> = {
  pending: "En attente",
  contacted: "Contacté",
  accepted: "Accepté",
  cancelled: "Annulé",
};

export const STATUS_BADGES: Record<TrainingRegistrationStatus, string> = {
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  contacted: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  accepted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  cancelled: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

export function getStatusLabel(status: TrainingRegistrationStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusBadge(status: TrainingRegistrationStatus): string {
  return STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-border";
}