import type { APIAdminUser } from "@/data/auth";

export type APIAdminProfile = APIAdminUser;

export interface AdminProfilePayload {
  firstName: string;
  lastName: string;
  bio?: string;
  photo?: File | null;
  removePhoto?: boolean;
}

export interface AdminEmailChangeRequestPayload {
  newEmail: string;
  password: string;
}

export interface AdminEmailChangeConfirmPayload {
  code: string;
}

export interface AdminPasswordChangePayload {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
  revokeOtherSessions: boolean;
}

export interface APIAdminPasswordChangeResponse {
  message: string;
  revokedSessions: number;
}

export interface APIAdminEmailChangeRequestResponse {
  message: string;
  hint: string;
  expiresInMinutes: number;
}
