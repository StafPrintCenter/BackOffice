export type AdminLevel = "super_admin" | "admin" | string;

/**
 * Type aligné sur la réponse de l'API admin /auth/login (champ "admin")
 * et /auth/me (racine directe)
 */
export type APIAdminUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  photo: string | null;
  bio: string | null;
  email_verified_at: string | null;
  level: AdminLevel;
  invited_by: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  is_active: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
  updated_at: string;
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