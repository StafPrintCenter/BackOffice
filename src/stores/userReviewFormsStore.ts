import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminReviewFormDetail,
  AdminReviewFormPayload,
  AdminReviewFormAnalytics,
} from "@/data/reviewsForms";

const resourceKey = "review-forms";
const basePath = "reviews/forms";

const store = createResourceStore<APIAdminReviewFormDetail, AdminReviewFormPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminReviewForms = store.fetchList;
export const fetchAdminReviewFormById = store.fetchById;
export const createAdminReviewForm = store.createItem;
export const updateAdminReviewForm = store.updateItem;
export const deleteAdminReviewForm = store.removeItem;

export const useAdminReviewFormsList = store.useList;
export const useAdminReviewFormDetail = store.useDetail;
export const useCreateAdminReviewForm = store.useCreate;
export const useUpdateAdminReviewForm = store.useUpdate;
export const useDeleteAdminReviewForm = store.useRemove;

/* ---- Actions dédiées, hors factory générique ---- */

async function fetchAnalytics(id: string): Promise<AdminReviewFormAnalytics> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/analytics`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des analyses");
  // Pas d'enveloppe { data } sur cet endpoint, contrairement au reste de la ressource.
  return response.json();
}

async function publishForm(id: string): Promise<APIAdminReviewFormDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/publish`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la publication du formulaire");
  const json = await response.json();
  return json.data;
}

async function disableForm(id: string): Promise<APIAdminReviewFormDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/disable`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la désactivation du formulaire");
  const json = await response.json();
  return json.data;
}

async function duplicateForm(id: string): Promise<APIAdminReviewFormDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/duplicate`, { method: "POST" });
  if (!response.ok) throw new Error("Erreur lors de la duplication du formulaire");
  const json = await response.json();
  return json.data;
}

export const fetchAdminReviewFormAnalytics = fetchAnalytics;
export const publishAdminReviewForm = publishForm;
export const disableAdminReviewForm = disableForm;
export const duplicateAdminReviewForm = duplicateForm;

export function useAdminReviewFormAnalytics(id: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "analytics", id],
    queryFn: () => fetchAnalytics(id as string),
    enabled: !!id,
  });
  return { analytics: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

export function usePublishAdminReviewForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishForm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useDisableAdminReviewForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disableForm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useDuplicateAdminReviewForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateForm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}