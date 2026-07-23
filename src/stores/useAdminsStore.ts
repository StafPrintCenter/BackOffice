import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminAdminDetail, AdminAdminBlockPayload } from "@/data/admins";

const resourceKey = "admins";
const basePath = "admins";

const store = createResourceStore<APIAdminAdminDetail, AdminAdminBlockPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminAdmins = store.fetchList;
export const fetchAdminAdminById = store.fetchById;

export const useAdminAdminsList = store.useList;
export const useAdminAdminDetail = store.useDetail;

/* ---- Actions dédiées ---- */

async function inviteAdmin(payload: import("@/data/admins").AdminAdminInvitePayload): Promise<APIAdminAdminDetail> {
  const fd = new FormData();
  fd.append("first_name", payload.first_name);
  fd.append("last_name", payload.last_name);
  fd.append("email", payload.email);
  fd.append("level", payload.level);
  const response = await adminFetch(`/api/admin/${basePath}/invite`, { method: "POST", body: fd });
  if (!response.ok) throw new Error("Erreur lors de l'invitation de l'administrateur");
  const json = await response.json();
  return json.data;
}

async function alertAdmin(id: string, subject: string, message: string): Promise<void> {
  const fd = new FormData();
  fd.append("subject", subject);
  fd.append("message", message);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/alert`, { method: "POST", body: fd });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'alerte");
}

async function blockAdmin(id: string, reason: string): Promise<APIAdminAdminDetail> {
  const fd = new FormData();
  fd.append("reason", reason);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/block`, { method: "PUT", body: fd });
  if (!response.ok) throw new Error("Erreur lors du blocage de l'administrateur");
  const json = await response.json();
  return json.data;
}

async function reactivateAdmin(id: string): Promise<APIAdminAdminDetail | null> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la réactivation de l'administrateur");
  try {
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export function useInviteAdminAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: import("@/data/admins").AdminAdminInvitePayload) => inviteAdmin(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useAlertAdminAdmin() {
  return useMutation({
    mutationFn: ({ id, subject, message }: { id: string; subject: string; message: string }) =>
      alertAdmin(id, subject, message),
  });
}

export function useBlockAdminAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => blockAdmin(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateAdmin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}