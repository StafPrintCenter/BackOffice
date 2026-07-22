import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminContactDetail, AdminContactStatusPayload } from "@/data/contact";

const store = createResourceStore<APIAdminContactDetail, AdminContactStatusPayload>({
  resourceKey: "contacts",
  basePath: "contact",
});

export const fetchAdminContacts = store.fetchList;
export const fetchAdminContactById = store.fetchById;

export const useAdminContactsList = store.useList;
export const useAdminContactDetail = store.useDetail;

async function updateContactStatus(
  id: string,
  payload: AdminContactStatusPayload
): Promise<APIAdminContactDetail> {
  const fd = new FormData();
  fd.append("status", payload.status);
  if (payload.admin_notes !== undefined) fd.append("admin_notes", payload.admin_notes ?? "");

  const response = await adminFetch(`/api/admin/contact/${id}/status`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut du message");
  const json: { data: APIAdminContactDetail } = await response.json();
  return json.data;
}

export function useUpdateAdminContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminContactStatusPayload }) =>
      updateContactStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}