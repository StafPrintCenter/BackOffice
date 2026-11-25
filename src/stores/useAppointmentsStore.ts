import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminAppointment,
  APIAppointmentCalendar,
  AdminAppointmentStatusPayload,
} from "@/data/appointments";

const store = createResourceStore<APIAdminAppointment, AdminAppointmentStatusPayload>({
  resourceKey: "appointments",
  basePath: "appointments",
});

export const fetchAdminAppointments = store.fetchList;
export const fetchAdminAppointmentById = store.fetchById;

export const useAdminAppointmentsList = store.useList;
export const useAdminAppointmentDetail = store.useDetail;

export function useAdminAppointmentCalendar(from?: string, to?: string) {
  const query = useQuery({
    queryKey: ["appointments", "calendar", from, to],
    enabled: Boolean(from && to),
    staleTime: 30_000,
    queryFn: async () => {
      if (!from || !to) {
        throw new Error("Une période est nécessaire pour charger le calendrier des rendez-vous.");
      }
      const params = new URLSearchParams({ from, to });
      const response = await adminFetch(`/api/admin/appointments/calendar?${params}`);
      if (!response.ok) {
        throw await parseApiError(response, "Erreur lors du chargement du calendrier des rendez-vous");
      }
      return (await response.json()) as APIAppointmentCalendar;
    },
  });

  return {
    calendar: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

async function updateAppointmentStatus(
  id: string,
  payload: AdminAppointmentStatusPayload
): Promise<APIAdminAppointment> {
  const fd = new FormData();
  fd.append("status", payload.status);
  if (payload.admin_notes !== undefined) fd.append("admin_notes", payload.admin_notes ?? "");
  if (payload.date !== undefined) fd.append("date", payload.date);
  if (payload.time !== undefined) fd.append("time", payload.time);

  const response = await adminFetch(`/api/admin/appointments/${id}/status`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la mise à jour du statut du rendez-vous");
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