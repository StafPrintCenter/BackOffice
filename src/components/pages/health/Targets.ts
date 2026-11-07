const HEALTH_TARGET_ROUTES: Record<string, string> = {
  "security.mfa": "/security/mfa",
  "security.mfa.totp": "/security/mfa",
  "security.mfa.passkey": "/security/mfa",
  "security.mfa.recovery": "/security/mfa",
  "security.password": "/security/mfa",
  "security.sessions": "/security/sessions",
  "profile.edit": "/profile",
  "profile.photo": "/profile",
  "profile.email": "/profile",
};

export const resolveHealthTarget = (target: string): string | null =>
  HEALTH_TARGET_ROUTES[target] ?? null;