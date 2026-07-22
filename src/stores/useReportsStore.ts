import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminReport, AdminReportStatusPayload } from "@/data/reports";

const store = createResourceStore<APIAdminReport, AdminReportStatusPayload>({
  resourceKey: "reports",
  basePath: "reports",
});

export const fetchAdminReports = store.fetchList;
export const fetchAdminReportById = store.fetchById;

export const useAdminReportsList = store.useList;
export const useAdminReportDetail = store.useDetail;

// ⚠️ Pas de create/delete pour cette ressource. Update = PUT /reports/{id}/status,
// et l'API n'accepte que { status } (pas de admin_notes ici, contrairement à contact/appointments).
async function updateReportStatus(
  id: string,
  payload: AdminReportStatusPayload
): Promise<APIAdminReport> {
  const fd = new FormData();
  fd.append("status", payload.status);

  const response = await adminFetch(`/api/admin/reports/${id}/status`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut du signalement");
  const json: { data: APIAdminReport } = await response.json();
  return json.data;
}

export function useUpdateAdminReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminReportStatusPayload }) =>
      updateReportStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}