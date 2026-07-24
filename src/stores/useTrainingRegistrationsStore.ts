import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminTrainingRegistration, AdminTrainingRegistrationStatusPayload } from "@/data/trainingRegistrations";

const RESOURCE_KEY = "training-registrations";
const BASE_PATH = "trainings/registrations";

// Comme pour contact/appointments/reports : pas de create/delete pour cette ressource,
// la factory ne sert qu'à list/detail.
const store = createResourceStore<APIAdminTrainingRegistration, AdminTrainingRegistrationStatusPayload>({
  resourceKey: RESOURCE_KEY,
  basePath: BASE_PATH,
});

export const fetchAdminTrainingRegistrations = store.fetchList;
export const fetchAdminTrainingRegistrationById = store.fetchById;

export const useAdminTrainingRegistrationsList = store.useList;
export const useAdminTrainingRegistrationDetail = store.useDetail;

// ⚠️ Update = PUT /trainings/registrations/{id}/status avec { status, admin_notes }.
async function updateTrainingRegistrationStatus(
  id: string,
  payload: AdminTrainingRegistrationStatusPayload
): Promise<APIAdminTrainingRegistration> {
  const fd = new FormData();
  fd.append("status", payload.status);
  if (payload.admin_notes !== undefined) fd.append("admin_notes", payload.admin_notes ?? "");

  const response = await adminFetch(`/api/admin/${BASE_PATH}/${id}/status`, {
    method: "PUT",
    body: fd,
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut de l'inscription");
  const json: { data: APIAdminTrainingRegistration } = await response.json();
  return json.data;
}

export const updateAdminTrainingRegistrationStatus = updateTrainingRegistrationStatus;

export function useUpdateAdminTrainingRegistrationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminTrainingRegistrationStatusPayload }) =>
      updateTrainingRegistrationStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESOURCE_KEY] }),
  });
}