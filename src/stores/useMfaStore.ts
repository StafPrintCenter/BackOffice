import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIAdminMfaStatus,
  APIAdminMfaRecoveryCodes,
  APIAdminMfaTotpSetup,
  AdminMfaPasswordPayload,
  AdminMfaDefaultPayload,
  AdminMfaTotpConfirmPayload,
  AdminMfaDeleteMethodPayload,
} from "@/data/mfa";

export class AdminMfaApiError extends Error { }

const RESOURCE_KEY = "mfa";
const STATUS_KEY = [RESOURCE_KEY, "status"] as const;
const BASE = "/api/admin/account/security/mfa";

/** Payload -> FormData (booléens en "1"/"0", undefined ignoré). */
function buildMfaFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") fd.append(key, value ? "1" : "0");
    else fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function mfaRequest<T>(path: string, init: RequestInit | undefined, fallbackMessage: string): Promise<T> {
  const response = await adminFetch(`${BASE}${path}`, init);
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new AdminMfaApiError(error.message);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Fonctions
// ---------------------------------------------------------------------------
export const fetchAdminMfaStatus = () =>
  mfaRequest<APIAdminMfaStatus>("", undefined, "Erreur lors de la récupération de la double authentification.");

export const enableAdminMfa = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    "/enable",
    { method: "POST", body: buildMfaFormData({ ...payload }) },
    "Impossible d'activer la double authentification.",
  );

export const disableAdminMfa = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    "/disable",
    { method: "POST", body: buildMfaFormData({ ...payload }) },
    "Impossible de désactiver la double authentification.",
  );

export const setAdminMfaDefaultMethod = (payload: AdminMfaDefaultPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    "/default",
    { method: "PUT", body: buildMfaFormData({ ...payload }) },
    "Impossible de définir la méthode par défaut.",
  );

export const regenerateAdminMfaRecoveryCodes = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaRecoveryCodes>(
    "/recovery-codes/regenerate",
    { method: "POST", body: buildMfaFormData({ ...payload }) },
    "Impossible de générer les codes de secours.",
  );

export const setupAdminMfaTotp = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaTotpSetup>(
    "/totp/setup",
    { method: "POST", body: buildMfaFormData({ ...payload }) },
    "Impossible de démarrer la configuration de l'application d'authentification.",
  );

export const confirmAdminMfaTotp = (payload: AdminMfaTotpConfirmPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    "/totp/confirm",
    { method: "POST", body: buildMfaFormData({ ...payload }) },
    "Code invalide ou expiré.",
  );

export const deleteAdminMfaMethod = ({ id, password }: AdminMfaDeleteMethodPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    `/methods/${id}`,
    { method: "DELETE", body: buildMfaFormData({ password }) },
    "Impossible de supprimer cette méthode.",
  );

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
export function useAdminMfaStatus() {
  const query = useQuery({
    queryKey: STATUS_KEY,
    queryFn: fetchAdminMfaStatus,
    staleTime: 1000 * 30,
  });
  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Met le statut à jour immédiatement avec la réponse, puis invalide le cache. */
function useSyncMfaStatus() {
  const qc = useQueryClient();
  return (status: APIAdminMfaStatus) => {
    qc.setQueryData(STATUS_KEY, status);
    qc.invalidateQueries({ queryKey: [RESOURCE_KEY] });
  };
}

export function useEnableAdminMfa() {
  const sync = useSyncMfaStatus();
  return useMutation({ mutationFn: (p: AdminMfaPasswordPayload) => enableAdminMfa(p), onSuccess: sync });
}

export function useDisableAdminMfa() {
  const sync = useSyncMfaStatus();
  return useMutation({ mutationFn: (p: AdminMfaPasswordPayload) => disableAdminMfa(p), onSuccess: sync });
}

export function useSetAdminMfaDefaultMethod() {
  const sync = useSyncMfaStatus();
  return useMutation({ mutationFn: (p: AdminMfaDefaultPayload) => setAdminMfaDefaultMethod(p), onSuccess: sync });
}

export function useConfirmAdminMfaTotp() {
  const sync = useSyncMfaStatus();
  return useMutation({ mutationFn: (p: AdminMfaTotpConfirmPayload) => confirmAdminMfaTotp(p), onSuccess: sync });
}

export function useDeleteAdminMfaMethod() {
  const sync = useSyncMfaStatus();
  return useMutation({ mutationFn: (p: AdminMfaDeleteMethodPayload) => deleteAdminMfaMethod(p), onSuccess: sync });
}

/** Les codes ne sont PAS mis en cache (affichés une seule fois) : on invalide seulement le compteur. */
export function useRegenerateAdminMfaRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: AdminMfaPasswordPayload) => regenerateAdminMfaRecoveryCodes(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESOURCE_KEY] }),
  });
}

/** Étape 1/2 du TOTP : rien ne change côté statut tant que le code n'est pas confirmé, donc pas d'invalidation. */
export function useSetupAdminMfaTotp() {
  return useMutation({ mutationFn: (p: AdminMfaPasswordPayload) => setupAdminMfaTotp(p) });
}