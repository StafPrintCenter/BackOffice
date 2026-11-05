export type MfaMethodType = "email" | "totp";

// ---------- Lecture (camelCase, tel que renvoyé par l'API) ----------
export interface APIAdminMfaMethod {
  id: string | null;
  type: MfaMethodType;
  label: string;
  hint: string | null;
  enabled: boolean;
  confirmedAt: string | null;
  lastUsedAt: string | null;
}

export interface APIAdminMfaStatus {
  enabled: boolean;
  enforced: boolean;
  defaultMethod: MfaMethodType;
  methods: APIAdminMfaMethod[];
  recoveryCodesRemaining: number;
  recoveryCodesGeneratedAt: string | null;
}

export interface APIAdminMfaRecoveryCodes {
  recoveryCodes: string[];
  recoveryCodesRemaining: number;
}

export interface APIAdminMfaTotpSetup {
  secret: string;
  otpauthUri: string;
  issuer: string;
  account: string;
}

// ---------- Écriture (clés = celles attendues par l'API, cf. curl) ----------
export interface AdminMfaPasswordPayload {
  password: string;
}

export interface AdminMfaDefaultPayload {
  method: MfaMethodType;
}

export interface AdminMfaTotpConfirmPayload {
  code: string;
  makeDefault?: boolean;
}

export interface AdminMfaDeleteMethodPayload {
  id: string;
  password: string;
}