import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type {
  APIPaginatedPendingContentReviews,
  PendingContentReviewsParams,
  AdminContentReviewPayload,
  APIAdminContentReview,
} from "@/data/contentReviews";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function fetchPendingReviews(): Promise<APIPendingContentReviews> {
  const response = await adminFetch(`/api/admin/trainings/content-reviews/pending`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des soumissions en attente");
  return response.json();
}

export function usePendingContentReviews() {
  const query = useQuery({
    queryKey: ["content-reviews", "pending"],
    queryFn: fetchPendingReviews,
    staleTime: 1000 * 15,
  });
  return {
    modules: query.data?.modules ?? [],
    lessons: query.data?.lessons ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

async function createReview(payload: AdminContentReviewPayload): Promise<APIAdminContentReview> {
  const response = await adminFetch(`/api/admin/trainings/content-reviews/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'enregistrement de la décision");
  const json: { data: APIAdminContentReview } = await response.json();
  return json.data;
}

export const createAdminContentReview = createReview;

export function useCreateAdminContentReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminContentReviewPayload) => createReview(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["content-reviews", "pending"] });
      qc.invalidateQueries({ queryKey: ["training-modules"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}