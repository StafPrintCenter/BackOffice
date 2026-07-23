export type APIAdminUserListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  photo: string | null;
  bio: string | null;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  blockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminUserDetail = APIAdminUserListItem & {
  blockedReason: string | null;
};

export interface AdminUserAlertPayload {
  subject: string;
  message: string;
}

export interface AdminUserBlockPayload {
  reason: string;
}