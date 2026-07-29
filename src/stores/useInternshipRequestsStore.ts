import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminInternshipRequest, AdminInternshipRequestStatusPayload, AdminInternshipRequestInfoPayload,
} from "@/data/internshipRequests";

const resourceKey = "internship-requests";
const basePath = "internships/requests";

// Pas de create/delete mentionnés pour cette ressource : la factory ne sert qu'à list/detail.
const store = createResourceStore<APIAdminInternshipRequest, AdminInternshipRequestStatusPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminInternshipRequests = store.fetchList;
export const fetchAdminInternshipRequestById = store.fetchById;

export const useAdminInternshipRequestsList = store.useList;
export const useAdminInternshipRequestDetail = store.useDetail;

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

// Endpoint 
async function updateStatus(id: string, payload: AdminInternshipRequestStatusPayload): Promise<APIAdminInternshipRequest> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour de la demande");
  const json: { data: APIAdminInternshipRequest } = await response.json();
  return json.data;
}

export const updateAdminInternshipRequestStatus = updateStatus;

export function useUpdateAdminInternshipRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminInternshipRequestStatusPayload }) => updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Actions dédiées, hors factory générique ---- */

async function requestInfo(id: string, payload: AdminInternshipRequestInfoPayload): Promise<APIAdminInternshipRequest> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/request-info`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la demande d'informations");
  const json = await response.json();
  return json.data;
}

async function acceptRequest(id: string): Promise<APIAdminInternshipRequest> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/accept`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de l'acceptation de la demande");
  const json = await response.json();
  return json.data;
}

async function rejectRequest(id: string): Promise<APIAdminInternshipRequest> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reject`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors du rejet de la demande");
  const json = await response.json();
  return json.data;
}

export const requestInfoAdminInternshipRequest = requestInfo;
export const acceptAdminInternshipRequest = acceptRequest;
export const rejectAdminInternshipRequest = rejectRequest;

export function useRequestInfoAdminInternshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminInternshipRequestInfoPayload }) => requestInfo(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useAcceptAdminInternshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useRejectAdminInternshipRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}