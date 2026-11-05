import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIAdminSession,
  APIAdminSessionsResponse,
  APIAdminSessionMessage,
  APIAdminSessionRevokeResponse,
} from "@/data/security-session";

export class AdminSessionsApiError extends Error { }

const SESSIONS_KEY = ["admin-sessions"] as const;
const BASE_PATH = "/api/admin/account/sessions";

async function sessionsRequest<T>(
  path: string,
  fallbackMessage: string,
  method?: "POST" | "DELETE"
): Promise<T> {
  const response = await adminFetch(`${BASE_PATH}${path}`, method ? { method } : undefined);
  if (!response.ok) {
    const error = await parseApiError(response, fallbackMessage);
    throw new AdminSessionsApiError(error.message);
  }
  return response.json();
}

/* ---------- Fonctions ---------- */

export const fetchAdminSessions = () =>
  sessionsRequest<APIAdminSessionsResponse>("", "Impossible de charger vos sessions.");

export const deleteAdminSession = (id: number) =>
  sessionsRequest<APIAdminSessionMessage>(`/${id}`, "Impossible de fermer cette session.", "DELETE");

export const revokeOtherAdminSessions = () =>
  sessionsRequest<APIAdminSessionRevokeResponse>(
    "/revoke-others",
    "Impossible de fermer les autres sessions.",
    "POST"
  );

export const revokeAllAdminSessions = () =>
  sessionsRequest<APIAdminSessionRevokeResponse>(
    "/revoke-all",
    "Impossible de fermer les sessions.",
    "POST"
  );

/* ---------- Hooks ---------- */

export function useAdminSessionsList() {
  const query = useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: fetchAdminSessions,
    staleTime: 1000 * 30,
  });
  return {
    items: (query.data?.data ?? []) as APIAdminSession[],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDeleteAdminSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });
}

export function useRevokeOtherAdminSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeOtherAdminSessions(),
    onSuccess: () => qc.invalidateQueries({ queryKey: SESSIONS_KEY }),
  });
}

/** La session actuelle est fermée aussi : on retire la liste du cache au lieu de la recharger (401) */
export function useRevokeAllAdminSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeAllAdminSessions(),
    onSuccess: () => qc.removeQueries({ queryKey: SESSIONS_KEY }),
  });
}