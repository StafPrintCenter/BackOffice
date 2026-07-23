import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminReviewInvitation, AdminReviewInvitationPayload } from "@/data/reviewInvitations";

const resourceKey = "review-invitations";
const basePath = "reviews/invitations";

// Ressource "reviews/invitations" : ni update ni delete génériques côté API.
// On ne réutilise createResourceStore que pour fetchList / fetchById / create.
const store = createResourceStore<APIAdminReviewInvitation, AdminReviewInvitationPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminReviewInvitations = store.fetchList;
export const fetchAdminReviewInvitationById = store.fetchById;
export const createAdminReviewInvitation = store.createItem;

export const useAdminReviewInvitationsList = store.useList;
export const useAdminReviewInvitationDetail = store.useDetail;
export const useCreateAdminReviewInvitation = store.useCreate;

/* ---- Actions dédiées ---- */

async function revokeInvitation(id: string): Promise<APIAdminReviewInvitation> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/revoke`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la révocation de l'invitation");
  const json = await response.json();
  return json.data;
}

export function useRevokeAdminReviewInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInvitation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

// NOTE : pas encore câblé — le curl "renvoyer" fourni est identique à "révoquer".
// Une fois l'endpoint réel confirmé (ex: /resend), décommenter et adapter :
//
// async function resendInvitation(id: string): Promise<APIAdminReviewInvitation> {
//   const response = await adminFetch(`/api/admin/${basePath}/${id}/resend`, { method: "PUT" });
//   if (!response.ok) throw new Error("Erreur lors du renvoi de l'invitation");
//   const json = await response.json();
//   return json.data;
// }
//
// export function useResendAdminReviewInvitation() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) => resendInvitation(id),
//     onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
//   });
// }