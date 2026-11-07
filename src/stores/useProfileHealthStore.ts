import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIAdminHealth,
  APIAdminHealthRecommendation,
  APIAdminHealthDismissResponse,
  AdminHealthDismissPayload,
} from "@/data/profileHealth";

export class AdminHealthApiError extends Error { }

export const HEALTH_KEY = ["admin-profile-health"] as const;
const BASE_PATH = "/api/admin/account/profile-health";
const EMPTY_RECOMMENDATIONS: APIAdminHealthRecommendation[] = [];

export async function fetchAdminProfileHealth(includeDismissed = false): Promise<APIAdminHealth> {
  const query = includeDismissed ? "?includeDismissed=true" : "";
  const response = await adminFetch(`${BASE_PATH}${query}`);
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible de charger la santé du compte.");
    throw new AdminHealthApiError(error.message);
  }
  return response.json();
}

export async function dismissAdminHealthRecommendation(
  payload: AdminHealthDismissPayload
): Promise<APIAdminHealthDismissResponse> {
  const fd = new FormData();
  fd.append("id", payload.id);
  fd.append("restore", payload.restore ? "1" : "0");

  const response = await adminFetch(`${BASE_PATH}/dismiss`, { method: "POST", body: fd });
  if (!response.ok) {
    const error = await parseApiError(response, "Impossible de modifier cette recommandation.");
    throw new AdminHealthApiError(error.message);
  }
  return response.json();
}

export function useAdminProfileHealth({ includeDismissed = false } = {}) {
  const query = useQuery({
    queryKey: [...HEALTH_KEY, { includeDismissed }],
    queryFn: () => fetchAdminProfileHealth(includeDismissed),
    staleTime: 1000 * 60,
    retry: 1,
  });
  return {
    health: query.data ?? null,
    recommendations: query.data?.recommendations ?? EMPTY_RECOMMENDATIONS,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useDismissAdminHealthRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dismissAdminHealthRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: HEALTH_KEY }),
  });
}