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
  AdminMfaEmailMethodPayload,
} from "@/data/mfa";

export class AdminMfaApiError extends Error { }

export const MFA_KEY = ["admin-mfa"] as const;
const BASE_PATH = "/api/admin/account/security/mfa";

export function buildForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.append(key, value);
  return fd;
}

export async function mfaRequest<T>(
  path: string,
  fallbackMessage: string,
  init?: { method: "POST" | "PUT" | "DELETE"; body: FormData },
): Promise<T> {
  const response = await adminFetch(`${BASE_PATH}${path}`, init);
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new AdminMfaApiError(error.message);
  }
  return response.json();
}

/* ---------- Fonctions ---------- */

export const fetchAdminMfaStatus = () =>
  mfaRequest<APIAdminMfaStatus>("", "Impossible de charger les paramètres de sécurité.");

export const enableAdminMfa = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaStatus>("/enable", "Impossible d'activer la double authentification.", {
    method: "POST",
    body: buildForm({ password: payload.password }),
  });

export const disableAdminMfa = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    "/disable",
    "Impossible de désactiver la double authentification.",
    {
      method: "POST",
      body: buildForm({ password: payload.password }),
    },
  );

export const setAdminMfaDefault = (payload: AdminMfaDefaultPayload) =>
  mfaRequest<APIAdminMfaStatus>("/default", "Impossible de définir la méthode par défaut.", {
    method: "PUT",
    body: buildForm({ method: payload.method }),
  });

export const regenerateAdminMfaRecoveryCodes = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaRecoveryCodes>(
    "/recovery-codes/regenerate",
    "Impossible de générer de nouveaux codes de secours.",
    { method: "POST", body: buildForm({ password: payload.password }) },
  );

export const setupAdminMfaTotp = (payload: AdminMfaPasswordPayload) =>
  mfaRequest<APIAdminMfaTotpSetup>("/totp/setup", "Impossible de démarrer la configuration.", {
    method: "POST",
    body: buildForm({ password: payload.password }),
  });

export const confirmAdminMfaTotp = (payload: AdminMfaTotpConfirmPayload) =>
  mfaRequest<APIAdminMfaStatus>("/totp/confirm", "Code invalide ou expiré.", {
    method: "POST",
    body: buildForm({
      code: payload.code,
      makeDefault: payload.makeDefault ? "1" : "0",
    }),
  });

export const deleteAdminMfaMethod = (payload: AdminMfaDeleteMethodPayload) =>
  mfaRequest<APIAdminMfaStatus>(
    `/totp/${payload.id}`,
    "Impossible de supprimer cette méthode.",
    {
      method: "DELETE",
      body: buildForm({ password: payload.password }),
    },
  );

export const setAdminMfaEmailMethod = (payload: AdminMfaEmailMethodPayload) =>
  mfaRequest<APIAdminMfaStatus>("/email", "Impossible de modifier la méthode e-mail.", {
    method: "PUT",
    body: buildForm({
      enabled: payload.enabled ? "1" : "0",
      password: payload.password,
    }),
  });

/* ---------- Hooks ---------- */

export function useAdminMfaStatus() {
  const query = useQuery({
    queryKey: MFA_KEY,
    queryFn: fetchAdminMfaStatus,
    staleTime: 1000 * 30,
    retry: false,
  });
  return {
    status: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/** Les mutations qui renvoient l'état MFA complet le placent directement dans le cache */
function useStatusMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<APIAdminMfaStatus>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (status) => qc.setQueryData(MFA_KEY, status),
  });
}

export const useEnableAdminMfa = () => useStatusMutation(enableAdminMfa);
export const useDisableAdminMfa = () => useStatusMutation(disableAdminMfa);
export const useSetAdminMfaDefault = () => useStatusMutation(setAdminMfaDefault);
export const useConfirmAdminMfaTotp = () => useStatusMutation(confirmAdminMfaTotp);
export const useDeleteAdminMfaMethod = () => useStatusMutation(deleteAdminMfaMethod);
export const useSetAdminMfaEmailMethod = () => useStatusMutation(setAdminMfaEmailMethod);

export function useSetupAdminMfaTotp() {
  return useMutation({ mutationFn: setupAdminMfaTotp });
}

/** La régénération ne renvoie que les codes : on invalide l'état pour rafraîchir le compteur */
export function useRegenerateAdminMfaRecoveryCodes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: regenerateAdminMfaRecoveryCodes,
    onSuccess: () => qc.invalidateQueries({ queryKey: MFA_KEY }),
  });
}
