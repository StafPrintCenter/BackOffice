import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIAdminProfile,
  AdminProfilePayload,
  AdminEmailChangeRequestPayload,
  AdminEmailChangeConfirmPayload,
  AdminPasswordChangePayload,
  APIAdminPasswordChangeResponse,
  APIAdminEmailChangeRequestResponse,
} from "@/data/account";

export class AdminAccountApiError extends Error { }

async function accountRequest<T>(
  path: string,
  method: "POST" | "PUT",
  body: FormData,
  fallbackMessage: string
): Promise<T> {
  const response = await adminFetch(`/api/admin/account/${path}`, { method, body });
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new AdminAccountApiError(error.message);
  }
  return response.json();
}

export async function updateAdminProfile(payload: AdminProfilePayload): Promise<APIAdminProfile> {
  const fd = new FormData();
  fd.append("firstName", payload.firstName);
  fd.append("lastName", payload.lastName);
  fd.append("bio", payload.bio ?? "");
  fd.append("removePhoto", payload.removePhoto ? "1" : "0");
  if (payload.photo) fd.append("photo", payload.photo);

  const json = await accountRequest<{ data: APIAdminProfile }>(
    "profile",
    "PUT",
    fd,
    "Impossible de modifier le profil.",
  );
  return json.data;
}

export async function requestAdminEmailChange(
  payload: AdminEmailChangeRequestPayload,
): Promise<APIAdminEmailChangeRequestResponse> {
  const fd = new FormData();
  fd.append("newEmail", payload.newEmail);
  fd.append("password", payload.password);

  return accountRequest<APIAdminEmailChangeRequestResponse>(
    "email/request",
    "POST",
    fd,
    "Impossible d'envoyer le code de confirmation.",
  );
}

export async function confirmAdminEmailChange(
  payload: AdminEmailChangeConfirmPayload,
): Promise<APIAdminProfile> {
  const fd = new FormData();
  fd.append("code", payload.code);

  const json = await accountRequest<{ data: APIAdminProfile }>(
    "email/confirm",
    "POST",
    fd,
    "Code invalide ou expiré.",
  );
  return json.data;
}

export async function changeAdminPassword(
  payload: AdminPasswordChangePayload,
): Promise<APIAdminPasswordChangeResponse> {
  const fd = new FormData();
  fd.append("currentPassword", payload.currentPassword);
  fd.append("password", payload.password);
  fd.append("password_confirmation", payload.passwordConfirmation);
  fd.append("revokeOtherSessions", String(payload.revokeOtherSessions));

  return accountRequest<APIAdminPasswordChangeResponse>(
    "password",
    "PUT",
    fd,
    "Impossible de modifier le mot de passe.",
  );
}

export function useUpdateAdminProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminProfilePayload) => updateAdminProfile(payload),
    onSuccess: (profile) => qc.setQueryData(["current-admin"], profile),
  });
}

/** Étape 1/2 : n'altère pas le compte, donc pas d'invalidation. */
export function useRequestAdminEmailChange() {
  return useMutation({
    mutationFn: (payload: AdminEmailChangeRequestPayload) => requestAdminEmailChange(payload),
  });
}

/** Étape 2/2 : l'e-mail change réellement, donc invalidation. */
export function useConfirmAdminEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminEmailChangeConfirmPayload) => confirmAdminEmailChange(payload),
    onSuccess: (profile) => qc.setQueryData(["current-admin"], profile),
  });
}

export function useChangeAdminPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPasswordChangePayload) => changeAdminPassword(payload),
    onSuccess: (_response, payload) => {
      if (payload.revokeOtherSessions) {
        return qc.invalidateQueries({ queryKey: ["admin-sessions"] });
      }
    },
  });
}
