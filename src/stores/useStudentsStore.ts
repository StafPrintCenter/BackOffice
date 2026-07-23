import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type { APIAdminStudentDetail, AdminStudentBlockPayload } from "@/data/students";

const resourceKey = "students";
const basePath = "students";

const store = createResourceStore<APIAdminStudentDetail, AdminStudentBlockPayload>({
  resourceKey,
  basePath,
});

export const fetchAdminStudents = store.fetchList;
export const fetchAdminStudentById = store.fetchById;

export const useAdminStudentsList = store.useList;
export const useAdminStudentDetail = store.useDetail;

/* ---- Actions dédiées ---- */

async function alertStudent(id: string, subject: string, message: string): Promise<void> {
  const fd = new FormData();
  fd.append("subject", subject);
  fd.append("message", message);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/alert`, { method: "POST", body: fd });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'alerte");
}

async function blockStudent(id: string, reason: string): Promise<APIAdminStudentDetail> {
  const fd = new FormData();
  fd.append("reason", reason);
  const response = await adminFetch(`/api/admin/${basePath}/${id}/block`, { method: "PUT", body: fd });
  if (!response.ok) throw new Error("Erreur lors du blocage de l'apprenant");
  const json = await response.json();
  return json.data;
}

async function reactivateStudent(id: string): Promise<APIAdminStudentDetail | null> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la réactivation de l'apprenant");
  try {
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export function useAlertAdminStudent() {
  return useMutation({
    mutationFn: ({ id, subject, message }: { id: string; subject: string; message: string }) =>
      alertStudent(id, subject, message),
  });
}

export function useBlockAdminStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => blockStudent(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}