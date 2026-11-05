export type AdminLevel = "super_admin" | "admin" | string;

/**
 * Type aligné sur la réponse de l'API admin (champ "admin")
 * et /auth/me (racine directe)
 */
export type APIAdminUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  // first_name?: string;
  // last_name?: string;
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

export type APIAdminLoginResponse = {
  admin: APIAdminUser;
  token: string;
};

export type AdminMfaLoginMethod = "email" | "totp" | "recovery";

export interface APIAdminMfaChallengeMethod {
  type: "email" | "totp";
  label: string;
  hint: string | null;
}

export interface APIAdminMfaChallenge {
  mfaRequired: true;
  challengeToken: string;
  defaultMethod: "email" | "totp";
  methods: APIAdminMfaChallengeMethod[];
  recoveryCodesAvailable: boolean;
  emailCodeSent: boolean;
  expiresAt: string;
}

export type APIAdminLoginResult = APIAdminLoginResponse | APIAdminMfaChallenge;

export interface AdminMfaVerifyPayload {
  challengeToken: string;
  method: AdminMfaLoginMethod;
  code: string;
}

export interface APIAdminMfaEmailResend {
  emailCodeSent: boolean;
  hint: string;
  retryAfter: number;
}

export function isAdminMfaChallenge(
  result: APIAdminLoginResult
): result is APIAdminMfaChallenge {
  return "mfaRequired" in result && result.mfaRequired === true;
}

export interface AdminInviteVerifyResponse {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
}