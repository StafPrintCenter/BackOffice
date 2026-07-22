import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminAppointment, AdminAppointmentStatusPayload } from "@/data/appointments";

const store = createResourceStore<APIAdminAppointment, AdminAppointmentStatusPayload>({
  resourceKey: "appointments",
  basePath: "appointments",
});

export const fetchAdminAppointments = store.fetchList;
export const fetchAdminAppointmentById = store.fetchById;

export const useAdminAppointmentsList = store.useList;
export const useAdminAppointmentDetail = store.useDetail;

async function updateAppointmentStatus(
  id: string,
  payload: AdminAppointmentStatusPayload
): Promise<APIAdminAppointment> {
  const fd = new FormData();
  fd.append("status", payload.status);
  if (payload.admin_notes !== undefined) fd.append("admin_notes", payload.admin_notes ?? "");

  const response = await adminFetch(`/api/admin/appointments/${id}/status`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut du rendez-vous");
  const json: { data: APIAdminAppointment } = await response.json();
  return json.data;
}

export function useUpdateAdminAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminAppointmentStatusPayload }) =>
      updateAppointmentStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}