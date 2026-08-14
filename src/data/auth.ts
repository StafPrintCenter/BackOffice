export type AdminLevel = "super_admin" | "admin" | string;

/**
 * Type aligné sur la réponse de l'API admin (champ "admin")
 * et /auth/me (racine directe)
 */
export type APIAdminUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  fullname?: string;
  name?: string;
  email: string;
  photo?: string | null;
  bio?: string | null;
  email_verified_at?: string | null;
  level: AdminLevel;
  invitedBy?: string | null;
  invited_by?: string | null;
  invitedAt?: string | null;
  invited_at?: string | null;
  acceptedAt?: string | null;
  accepted_at?: string | null;
  isActive?: boolean;
  is_active?: boolean;
  blockedAt?: string | null;
  blocked_at?: string | null;
  blockedReason?: string | null;
  blocked_reason?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export type APILoginResponse = {
  admin: APIAdminUser;
  token: string;
};

export interface AdminInviteVerifyResponse {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
}