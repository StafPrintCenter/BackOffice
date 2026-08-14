import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { PendingReviewsResponse, PendingReviewsParams, AdminContentReviewPayload, APIAdminContentReview } from "@/data/contentReviews";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function fetchPendingReviews(params: PendingReviewsParams = {}): Promise<PendingReviewsResponse> {
  const qp = new URLSearchParams();
  if (params.query) qp.append("query", params.query);
  if (params.sort_by) qp.append("sort_by", params.sort_by);
  if (params.sort_order) qp.append("sort_order", params.sort_order);
  if (params.per_page) qp.append("per_page", String(params.per_page));
  if (params.page) qp.append("page", String(params.page));

  const response = await adminFetch(`/api/admin/trainings/content-reviews/pending?${qp.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des soumissions en attente");
  return response.json();
}

export function usePendingContentReviews(params: PendingReviewsParams = {}) {
  const query = useQuery({
    queryKey: ["content-reviews", "pending", params],
    queryFn: () => fetchPendingReviews(params),
    staleTime: 1000 * 15,
  });

  return {
    trainingGroups: query.data?.data ?? [],
    meta: query.data
      ? {
        currentPage: query.data.current_page,
        lastPage: query.data.last_page,
        total: query.data.total,
        perPage: query.data.per_page,
        from: query.data.from,
        to: query.data.to,
      }
      : null,
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