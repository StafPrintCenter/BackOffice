export type TrainingInstructorRole = "lead" | "assistant";

export type APITrainingInstructorAssignment = {
  assignmentId: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  instructorPhoto: string | null;
  instructorIsActive: boolean;
  instructorIsBlocked: boolean;
  role: TrainingInstructorRole;
  assignedBy: string;
  assignedAt: string;
};

export interface AdminTrainingInstructorAssignPayload {
  instructor_id: string;
  role: TrainingInstructorRole;
}

export const TRAINING_INSTRUCTOR_ROLE_LABELS: Record<TrainingInstructorRole, string> = {
  lead: "Formateur principal",
  assistant: "Assistant",
};