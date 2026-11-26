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
