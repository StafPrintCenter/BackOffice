import type { APIAdminUser } from "@/data/auth";

export type APIAdminProfile = APIAdminUser;

// Écriture : les clés sont celles attendues par l'API (camelCase, cf. tes curl)
export interface AdminProfilePayload {
  firstName: string;
  lastName: string;
  bio?: string;
  photo?: File;            // nouvelle photo (omise si inchangée)
  removePhoto?: boolean;   // true => supprime la photo actuelle
}

export interface AdminEmailChangeRequestPayload {
  newEmail: string;
  password: string;
}

export interface APIAdminEmailChangeRequestResponse {
  message: string;
  hint: string;
  expiresInMinutes: number;
}

export interface AdminEmailChangeConfirmPayload {
  code: string;
}