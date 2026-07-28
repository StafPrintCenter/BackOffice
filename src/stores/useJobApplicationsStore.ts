import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminJobApplication, AdminJobApplicationStatusPayload } from "@/data/jobApplications";

const resourceKey = "job-applications";
const basePath = "jobs/applications";

const store = createResourceStore<APIAdminJobApplication, AdminJobApplicationStatusPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminJobApplications = store.fetchList;
export const fetchAdminJobApplicationById = store.fetchById;

export const useAdminJobApplicationsList = store.useList;
export const useAdminJobApplicationDetail = store.useDetail;

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function updateStatus(id: string, payload: AdminJobApplicationStatusPayload): Promise<APIAdminJobApplication> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour de la candidature");
  const json: { data: APIAdminJobApplication } = await response.json();
  return json.data;
}

export const updateAdminJobApplicationStatus = updateStatus;

export function useUpdateAdminJobApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminJobApplicationStatusPayload }) => updateStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Actions dédiées, hors factory générique ---- */

async function acceptApplication(id: string): Promise<APIAdminJobApplication> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/accept`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de l'acceptation de la candidature");
  const json = await response.json();
  return json.data;
}

async function rejectApplication(id: string): Promise<APIAdminJobApplication> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reject`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors du rejet de la candidature");
  const json = await response.json();
  return json.data;
}

export const acceptAdminJobApplication = acceptApplication;
export const rejectAdminJobApplication = rejectApplication;

export function useAcceptAdminJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useRejectAdminJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}