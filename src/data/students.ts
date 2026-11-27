import type { StudentTrainingEnrollment } from "@/data/trainingEnrollments";
import type { MemberSecuritySummary } from "@/data/memberSecurity";
import type { MemberActivityFields } from "@/data/memberAction";

export type APIAdminStudentListItem = MemberActivityFields & {
  id: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  occupation: string | null;
  photo: string | null;
  bio: string | null;
  isActive: boolean;
  isBlocked: boolean;
  blockedAt: string | null;
  createdAt: string;
  updatedAt: string;
  trainings: StudentTrainingEnrollment[];
};

export type APIAdminStudentDetail = APIAdminStudentListItem & {
  blockedReason: string | null;
  security: MemberSecuritySummary;
};

export interface AdminStudentBlockPayload {
  reason: string;
}