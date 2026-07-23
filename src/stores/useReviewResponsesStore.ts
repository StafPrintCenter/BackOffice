import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminReviewResponseDetail,
  AdminReviewResponsePublicationPayload,
} from "@/data/reviewResponses";

const resourceKey = "review-responses";
const basePath = "reviews/responses";

// Ressource "reviews/responses" : lecture seule côté formulaire (pas de create/delete),
// seule la mise à jour du statut de publication est exposée, via un sous-endpoint dédié.
const store = createResourceStore<APIAdminReviewResponseDetail, AdminReviewResponsePublicationPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminReviewResponses = store.fetchList;
export const fetchAdminReviewResponseById = store.fetchById;

export const useAdminReviewResponsesList = store.useList;
export const useAdminReviewResponseDetail = store.useDetail;

async function updatePublicationStatus(
  id: string,
  payload: AdminReviewResponsePublicationPayload
): Promise<APIAdminReviewResponseDetail> {
  const fd = new FormData();
  fd.append("publication_status", payload.publication_status);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/publication`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) {
    // Le backend renvoie un message métier explicite (ex: avis non autorisé à la publication) → on le propage.
    let message = "Erreur lors de la mise à jour du statut de publication";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore, on garde le message générique
    }
    throw new Error(message);
  }
  const json: { data: APIAdminReviewResponseDetail } = await response.json();
  return json.data;
}

export function useUpdateAdminReviewResponsePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminReviewResponsePublicationPayload }) =>
      updatePublicationStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}