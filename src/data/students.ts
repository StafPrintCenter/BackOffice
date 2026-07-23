export type APIAdminStudentListItem = {
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
};

export type APIAdminStudentDetail = APIAdminStudentListItem & {
  blockedReason: string | null;
};

export interface AdminStudentBlockPayload {
  reason: string;
}