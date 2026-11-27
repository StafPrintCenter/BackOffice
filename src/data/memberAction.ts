export type MemberActivityAuthMethod = "password" | "email" | "totp" | "recovery" | "passkey";

export const MEMBER_ACTIVITY_AUTH_METHOD_LABELS: Record<string, string> = {
  password: "Mot de passe",
  email: "Code par e-mail",
  totp: "Application d'authentification",
  recovery: "Code de secours",
  passkey: "Clé d'accès",
};

export interface MemberSecurityChecks {
  mfaEnabled: boolean;
  authenticatorOrPasskeyConfigured: boolean;
  passkeyConfigured: boolean;
  recoveryCodesAvailable: boolean;
  passwordRecent: boolean;
  sessionsWithinPolicy: boolean;
}

export interface MemberSecuritySummary {
  score: number;
  checks: MemberSecurityChecks;
  openSessions: number;
}

export interface MemberLastActivity {
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  authMethod: string | null;
}

export interface MemberActivityFields {
  lastActivityAt?: string | null;
  lastActivity?: MemberLastActivity | null;
}

export function formatLastActivityAt(date?: string | null): string {
  if (!date) return "Aucune activité";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}
