// ⚠️ Seules "pending" et "contacted" sont confirmées par les payloads reçus.
// À compléter si l'enum backend a d'autres valeurs (accepted, rejected, etc.)
export type TrainingRegistrationStatus = "pending" | "contacted" | "accepted" | "accepted" | "cancelled";

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