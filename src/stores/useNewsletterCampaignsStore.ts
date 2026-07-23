import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminNewsletterCampaignDetail,
  AdminNewsletterCampaignPayload,
  AdminNewsletterCampaignSchedulePayload,
} from "@/data/newsletterCampaigns";

const resourceKey = "newsletter-campaigns";
const basePath = "newsletter/campaigns";

const store = createResourceStore<APIAdminNewsletterCampaignDetail, AdminNewsletterCampaignPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminNewsletterCampaigns = store.fetchList;
export const fetchAdminNewsletterCampaignById = store.fetchById;
export const createAdminNewsletterCampaign = store.createItem;
export const updateAdminNewsletterCampaign = store.updateItem;
export const deleteAdminNewsletterCampaign = store.removeItem;

export const useAdminNewsletterCampaignsList = store.useList;
export const useAdminNewsletterCampaignDetail = store.useDetail;
export const useCreateAdminNewsletterCampaign = store.useCreate;
export const useUpdateAdminNewsletterCampaign = store.useUpdate;
export const useDeleteAdminNewsletterCampaign = store.useRemove;

/* ---- Actions dédiées, hors factory générique ---- */

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function scheduleCampaign(id: string, payload: AdminNewsletterCampaignSchedulePayload): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/schedule`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la programmation de la campagne");
  const json = await response.json();
  return json.data;
}

async function cancelScheduleCampaign(id: string): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/cancel-schedule`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de l'annulation de la programmation");
  const json = await response.json();
  return json.data;
}

async function sendCampaign(id: string): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/send`, { method: "POST" });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de la campagne");
  const json = await response.json();
  return json.data;
}

export const scheduleAdminNewsletterCampaign = scheduleCampaign;
export const cancelScheduleAdminNewsletterCampaign = cancelScheduleCampaign;
export const sendAdminNewsletterCampaign = sendCampaign;

export function useScheduleAdminNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminNewsletterCampaignSchedulePayload }) => scheduleCampaign(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useCancelScheduleAdminNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelScheduleCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useSendAdminNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}