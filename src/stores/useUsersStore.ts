import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminUserDetail, AdminUserBlockPayload } from "@/data/users";

const resourceKey = "users";
const basePath = "users";

// Ressource "users" : pas de create/update/delete génériques. On ne réutilise
// createResourceStore que pour fetchList/fetchById/useList/useDetail ; les actions
// (alerter, bloquer, réactiver) passent par des endpoints dédiés hors factory.
const store = createResourceStore<APIAdminUserDetail, AdminUserBlockPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminUsers = store.fetchList;
export const fetchAdminUserById = store.fetchById;

export const useAdminUsersList = store.useList;
export const useAdminUserDetail = store.useDetail;

/* ---- Actions dédiées ---- */

async function alertUser(id: string, subject: string, message: string): Promise<void> {
  const fd = new FormData();
  fd.append("subject", subject);
  fd.append("message", message);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/alert`, { method: "POST", body: fd });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'alerte");
}

async function blockUser(id: string, reason: string): Promise<APIAdminUserDetail> {
  const fd = new FormData();
  fd.append("reason", reason);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/block`, { method: "PUT", body: fd });
  if (!response.ok) throw new Error("Erreur lors du blocage de l'utilisateur");
  const json = await response.json();
  return json.data;
}

// "reactivate" ne renvoie pas forcément { data: ... } dans votre exemple ; on
// gère les deux cas et on invalide le cache dans tous les cas pour rafraîchir.
async function reactivateUser(id: string): Promise<APIAdminUserDetail | null> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la réactivation de l'utilisateur");
  try {
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export function useAlertAdminUser() {
  return useMutation({
    mutationFn: ({ id, subject, message }: { id: string; subject: string; message: string }) =>
      alertUser(id, subject, message),
  });
}

export function useBlockAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => blockUser(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}