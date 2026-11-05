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

const RESOURCE_KEY = "account";

/** Comme le builder générique, mais gère aussi les File (photo). */
function buildAccountFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, value === null ? "" : String(value));
    }
  }
  return fd;
}

export async function updateAdminProfile(payload: AdminProfilePayload): Promise<APIAdminProfile> {
  const response = await adminFetch(`/api/admin/account/profile`, {
    method: "PUT",
    body: buildAccountFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Erreur lors de la modification du profil.");
    throw new AdminAccountApiError(error.message);
  }
  const json: { data: APIAdminProfile } = await response.json();
  return json.data;
}

export async function requestAdminEmailChange(
  payload: AdminEmailChangeRequestPayload,
): Promise<APIAdminEmailChangeRequestResponse> {
  const response = await adminFetch(`/api/admin/account/email/request`, {
    method: "POST",
    body: buildAccountFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible d'envoyer le code de confirmation.");
    throw new AdminAccountApiError(error.message);
  }
  return response.json();
}

export async function confirmAdminEmailChange(
  payload: AdminEmailChangeConfirmPayload,
): Promise<APIAdminProfile> {
  const response = await adminFetch(`/api/admin/account/email/confirm`, {
    method: "POST",
    body: buildAccountFormData({ ...payload }),
  });
  if (!response.ok) {
    const error = await parseApiError(response, "Code invalide ou expiré.");
    throw new AdminAccountApiError(error.message);
  }
  const json: { data: APIAdminProfile } = await response.json();
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

function useInvalidateAccount() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [RESOURCE_KEY] });
    qc.invalidateQueries({ queryKey: ["current-admin"] }); // utilisé par useCurrentAdmin
  };
}

export function useUpdateAdminProfile() {
  const invalidate = useInvalidateAccount();
  return useMutation({
    mutationFn: (payload: AdminProfilePayload) => updateAdminProfile(payload),
    onSuccess: invalidate,
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
  const invalidate = useInvalidateAccount();
  return useMutation({
    mutationFn: (payload: AdminEmailChangeConfirmPayload) => confirmAdminEmailChange(payload),
    onSuccess: invalidate,
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
