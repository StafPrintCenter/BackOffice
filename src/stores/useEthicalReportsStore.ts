import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminEthicalReport, AdminEthicalReportStatusPayload } from "@/data/reports";

const store = createResourceStore<APIAdminEthicalReport>({
  resourceKey: "ethical-reports",
  basePath: "reports/ethical",
});

export const useAdminEthicalReportsList = store.useList;
export const useAdminEthicalReportDetail = store.useDetail;

async function updateEthicalReportStatus(
  id: string,
  payload: AdminEthicalReportStatusPayload
): Promise<APIAdminEthicalReport> {
  const formData = new FormData();
  formData.append("status", payload.status);

  const response = await adminFetch(`/api/admin/reports/ethical/${id}/status`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) {
    throw await parseApiError(response, "Erreur lors de la mise à jour du statut du signalement éthique");
  }

  const json: { data: APIAdminEthicalReport } = await response.json();
  return json.data;
}

export function useUpdateAdminEthicalReportStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminEthicalReportStatusPayload }) =>
      updateEthicalReportStatus(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ethical-reports"] }),
  });
}
