import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import { createResourceStore } from "./createResourceStore";
import type {
  APIAdminInstructor, AdminInstructorInvitePayload, AdminInstructorAlertPayload, AdminInstructorBlockPayload,
} from "@/data/instructors";

const resourceKey = "instructors";
const basePath = "instructors";

// Pas de create/update/delete standards — l'ajout se fait via /invite (route et payload différents).
// La factory ne sert qu'à list/detail.
const store = createResourceStore<APIAdminInstructor, AdminInstructorInvitePayload>({
  resourceKey,
  basePath,
});

export const fetchAdminInstructors = store.fetchList;
export const fetchAdminInstructorById = store.fetchById;

export const useAdminInstructorsList = store.useList;
export const useAdminInstructorDetail = store.useDetail;

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

/* ---- Invitation ---- */

async function inviteInstructor(payload: AdminInstructorInvitePayload): Promise<APIAdminInstructor> {
  const response = await adminFetch(`/api/admin/${basePath}/invite`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'invitation de l'instructeur");
  const json = await response.json();
  return json.data;
}

export const inviteAdminInstructor = inviteInstructor;

export function useInviteAdminInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminInstructorInvitePayload) => inviteInstructor(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

/* ---- Actions dédiées, hors factory générique ---- */

async function approveInstructor(id: string): Promise<APIAdminInstructor> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/approve`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de l'approbation de l'instructeur");
  const json = await response.json();
  return json.data;
}

// ⚠️ Réponse observée = { message } uniquement, pas d'enveloppe { data }.
async function resendInstructorInvite(id: string): Promise<{ message: string }> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/invite/resend`, { method: "POST" });
  if (!response.ok) throw new Error("Erreur lors du renvoi de l'invitation");
  return response.json();
}

async function revokeInstructorInvite(id: string): Promise<APIAdminInstructor> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/invite/revoke`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la révocation de l'invitation");
  const json = await response.json();
  return json.data;
}

// ⚠️ Réponse observée = { message } uniquement, pas d'enveloppe { data }.
async function alertInstructor(id: string, payload: AdminInstructorAlertPayload): Promise<{ message: string }> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/alert`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'alerte");
  return response.json();
}

async function blockInstructor(id: string, payload: AdminInstructorBlockPayload): Promise<APIAdminInstructor> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/block`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors du blocage de l'instructeur");
  const json = await response.json();
  return json.data;
}

async function reactivateInstructor(id: string): Promise<APIAdminInstructor> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la réactivation de l'instructeur");
  const json = await response.json();
  return json.data;
}

export const approveAdminInstructor = approveInstructor;
export const resendAdminInstructorInvite = resendInstructorInvite;
export const revokeAdminInstructorInvite = revokeInstructorInvite;
export const alertAdminInstructor = alertInstructor;
export const blockAdminInstructor = blockInstructor;
export const reactivateAdminInstructor = reactivateInstructor;

export function useApproveAdminInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveInstructor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useResendAdminInstructorInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resendInstructorInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useRevokeAdminInstructorInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInstructorInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useAlertAdminInstructor() {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminInstructorAlertPayload }) => alertInstructor(id, payload),
  });
}

export function useBlockAdminInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminInstructorBlockPayload }) => blockInstructor(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateInstructor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}