import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminJobOffer, AdminJobOfferPayload } from "@/data/jobOffers";

const resourceKey = "job-offers";
const basePath = "jobs/offers";

const store = createResourceStore<APIAdminJobOffer, AdminJobOfferPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminJobOffers = store.fetchList;
export const fetchAdminJobOfferById = store.fetchById;
export const createAdminJobOffer = store.createItem;
export const updateAdminJobOffer = store.updateItem;
export const deleteAdminJobOffer = store.removeItem;

export const useAdminJobOffersList = store.useList;
export const useAdminJobOfferDetail = store.useDetail;
export const useCreateAdminJobOffer = store.useCreate;
export const useUpdateAdminJobOffer = store.useUpdate;
export const useDeleteAdminJobOffer = store.useRemove;

/* ---- Actions dédiées, hors factory générique ---- */

async function publishOffer(id: string): Promise<APIAdminJobOffer> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/publish`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la publication de l'offre");
  const json = await response.json();
  return json.data;
}

async function disableOffer(id: string): Promise<APIAdminJobOffer> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/disable`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la désactivation de l'offre");
  const json = await response.json();
  return json.data;
}

async function reactivateOffer(id: string): Promise<APIAdminJobOffer> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la réactivation de l'offre");
  const json = await response.json();
  return json.data;
}

export const publishAdminJobOffer = publishOffer;
export const disableAdminJobOffer = disableOffer;
export const reactivateAdminJobOffer = reactivateOffer;

export function usePublishAdminJobOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useDisableAdminJobOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disableOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminJobOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateOffer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}