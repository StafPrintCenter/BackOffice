import { createResourceStore } from "./createResourceStore";
import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { AdminListParams } from "./createResourceStore";
import type { APIAdminArticleFeedback, APIAdminArticleFeedbackGroup, APIAdminArticleFeedbackGroupDetail } from "@/data/articleFeedback";

// Pas de create/update pour cette ressource — seuls list/detail/delete existent.
const store = createResourceStore<APIAdminArticleFeedback>({
  resourceKey: "article-feedback",
  basePath: "docs/article-feedback",
});

export const fetchAdminArticleFeedbacks = store.fetchList;
export const fetchAdminArticleFeedbackById = store.fetchById;
export const deleteAdminArticleFeedback = store.removeItem;

export const useAdminArticleFeedbacksList = store.useList;
export const useAdminArticleFeedbackDetail = store.useDetail;
export const useDeleteAdminArticleFeedback = store.useRemove;

interface GroupListResponse {
  data: APIAdminArticleFeedbackGroup[];
  links: unknown;
  meta: { current_page: number; last_page: number; total: number; per_page: number; from: number | null; to: number | null };
}

async function fetchArticleFeedbackGroups(params: AdminListParams = {}): Promise<GroupListResponse> {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qp.append(key, String(value));
  }
  const response = await adminFetch(`/api/admin/docs/article-feedback/groups?${qp.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des groupes de retours");
  return response.json();
}

export function useAdminArticleFeedbackGroupsList(params: AdminListParams = {}) {
  const query = useQuery({
    queryKey: ["article-feedback-groups", "admin-list", params],
    queryFn: () => fetchArticleFeedbackGroups(params),
    staleTime: 1000 * 30,
  });
  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

async function fetchArticleFeedbackGroup(articleKey: string): Promise<APIAdminArticleFeedbackGroupDetail | null> {
  const qp = new URLSearchParams({ article_key: articleKey });
  const response = await adminFetch(`/api/admin/docs/article-feedback/group?${qp.toString()}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Erreur lors de la récupération du groupe de retours");
  const json: { data: APIAdminArticleFeedbackGroupDetail } = await response.json();
  return json.data;
}

export function useAdminArticleFeedbackGroupDetail(articleKey: string | undefined) {
  const query = useQuery({
    queryKey: ["article-feedback-groups", "admin-detail", articleKey],
    queryFn: () => fetchArticleFeedbackGroup(articleKey as string),
    enabled: !!articleKey,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}