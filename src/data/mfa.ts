export type AdminMfaMethodType = "email" | "totp" | "passkey";

export interface APIAdminMfaMethod {
  id: string | null; // null pour la méthode e-mail
  type: AdminMfaMethodType;
  label: string;
  hint: string | null;
  enabled: boolean;
  confirmedAt: string | null;
  lastUsedAt: string | null;
}

export interface APIAdminMfaStatus {
  enabled: boolean;
  enforced: boolean;
  defaultMethod: AdminMfaMethodType;
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

export interface AdminMfaPasswordPayload {
  password: string;
}

export interface AdminMfaDefaultPayload {
  method: AdminMfaMethodType;
}

export interface AdminMfaTotpConfirmPayload {
  code: string;
  makeDefault?: boolean;
}

export interface AdminMfaDeleteMethodPayload {
  id: string;
  password: string;
}

export interface AdminMfaEmailMethodPayload {
  enabled: boolean;
  password: string;
}
