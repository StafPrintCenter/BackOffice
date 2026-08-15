import type { TrainingInstructorRole } from "@/data/trainingInstructors";

export type InstructorRegistrationSource = "invited" | "self_registered";

export interface APIAdminInstructorTrainingAssignment {
  assignmentId: string;
  trainingId: string;
  trainingTitle: string;
  trainingStatus: string;
  role: TrainingInstructorRole;
  assignedAt: string;
}

export type APIInstructorCategory = {
  id: string;
  name: string;
  slug?: string;
};

export type APIAdminInstructor = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  registrationSource: InstructorRegistrationSource | null;
  photo: string | null;
  bio: string | null;
  categories?: APIInstructorCategory[];
  isActive: boolean;
  isBlocked: boolean;
  isPending: boolean;
  needsApproval: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  approvedAt: string | null;
  trainings: APIAdminInstructorTrainingAssignment[];
  createdAt: string;
};

export interface AdminInstructorInvitePayload {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AdminInstructorAlertPayload {
  subject: string;
  message: string;
}

export interface AdminInstructorBlockPayload {
  reason: string;
}
