import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
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

function buildCampaignFormData(payload: AdminNewsletterCampaignPayload): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((item, index) => formData.append(`${key}[${index}]`, String(item)));
    } else {
      formData.append(key, value === null ? "" : String(value));
    }
  }
  return formData;
}

async function createCampaign(payload: AdminNewsletterCampaignPayload): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/create`, {
    method: "POST",
    body: buildCampaignFormData(payload),
  });
  if (!response.ok) throw await parseApiError(response, `Erreur lors de la création de "${resourceKey}"`);
  const json = await response.json();
  return json.data;
}

async function updateCampaign(id: string, payload: AdminNewsletterCampaignPayload): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`, {
    method: "PUT",
    body: buildCampaignFormData(payload),
  });
  if (!response.ok) throw await parseApiError(response, `Erreur lors de la modification de "${resourceKey}"`);
  const json = await response.json();
  return json.data;
}

export const fetchAdminNewsletterCampaigns = store.fetchList;
export const fetchAdminNewsletterCampaignById = store.fetchById;
export const createAdminNewsletterCampaign = createCampaign;
export const updateAdminNewsletterCampaign = updateCampaign;
export const deleteAdminNewsletterCampaign = store.removeItem;

export const useAdminNewsletterCampaignsList = store.useList;
export const useAdminNewsletterCampaignDetail = store.useDetail;
export const useDeleteAdminNewsletterCampaign = store.useRemove;

export function useCreateAdminNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useUpdateAdminNewsletterCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminNewsletterCampaignPayload }) =>
      updateCampaign(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

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
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la programmation de la campagne");
  const json = await response.json();
  return json.data;
}

async function cancelScheduleCampaign(id: string): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/cancel-schedule`, { method: "PUT" });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de l'annulation de la programmation");
  const json = await response.json();
  return json.data;
}

async function sendCampaign(id: string): Promise<APIAdminNewsletterCampaignDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/send`, { method: "POST" });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de l'envoi de la campagne");
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