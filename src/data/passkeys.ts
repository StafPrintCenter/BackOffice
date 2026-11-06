import type { APIAdminMfaStatus } from "@/data/mfa";

export interface APIPasskeyDescriptor {
  type: "public-key";
  id: string; // base64url
  transports?: string[];
}

/** Options de création (enregistrement) */
export interface APIAdminPasskeyCreationOptions {
  challenge: string;
  rp: { id: string; name: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: { type: "public-key"; alg: number }[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: APIPasskeyDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

/** Options d'authentification (connexion) */
export interface APIAdminPasskeyRequestOptions {
  challenge: string;
  rpId?: string;
  timeout?: number;
  allowCredentials?: APIPasskeyDescriptor[];
  userVerification?: UserVerificationRequirement;
}

export interface AdminPasskeyOptionsPayload {
  password: string;
}

export interface AdminPasskeyRegisterPayload {
  credential: string; // JSON sérialisé du résultat de navigator.credentials.create()
  name?: string;
  makeDefault?: boolean;
}

export interface APIAdminPasskeyRegisterResponse extends APIAdminMfaStatus {
  recoveryCodes?: string[]; // présents à la première configuration MFA
}