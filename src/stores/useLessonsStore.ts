import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { APIAdminLesson, AdminLessonPayload } from "@/data/trainingModules";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value === null ? "" : String(value));
    }
  }
  return fd;
}

/* ---- Création ---- */

async function createLesson(moduleId: string, payload: AdminLessonPayload): Promise<APIAdminLesson> {
  const response = await adminFetch(`/api/admin/trainings/${moduleId}/lessons/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de la leçon");
  const json: { data: APIAdminLesson } = await response.json();
  return json.data;
}

export const createAdminLesson = createLesson;

export function useCreateAdminLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: AdminLessonPayload }) =>
      createLesson(moduleId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", variables.moduleId] });
    },
  });
}

/* ---- Détail (route plate) ---- */

async function fetchLessonDetail(lessonId: string): Promise<APIAdminLesson> {
  const response = await adminFetch(`/api/admin/lessons/${lessonId}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération de la leçon");
  const json: { data: APIAdminLesson } = await response.json();
  return json.data;
}

export function useAdminLessonDetail(lessonId: string | undefined) {
  const query = useQuery({
    queryKey: ["lessons", "detail", lessonId],
    queryFn: () => fetchLessonDetail(lessonId as string),
    enabled: !!lessonId,
  });
  return { lesson: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Update / delete / publish (routes plates) ---- */

async function updateLesson(lessonId: string, payload: AdminLessonPayload): Promise<APIAdminLesson> {
  const response = await adminFetch(`/api/admin/lessons/${lessonId}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification de la leçon");
  const json: { data: APIAdminLesson } = await response.json();
  return json.data;
}

export const updateAdminLesson = updateLesson;

export function useUpdateAdminLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: AdminLessonPayload }) =>
      updateLesson(lessonId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", data.moduleId] });
      qc.invalidateQueries({ queryKey: ["lessons", "detail", data.id] });
    },
  });
}

async function deleteLesson(lessonId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors de la suppression de la leçon");
}

export const deleteAdminLesson = deleteLesson;

export function useDeleteAdminLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId }: { moduleId: string; lessonId: string }) => deleteLesson(lessonId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", variables.moduleId] });
    },
  });
}

async function publishLesson(lessonId: string): Promise<APIAdminLesson> {
  const response = await adminFetch(`/api/admin/lessons/${lessonId}/publish`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la publication de la leçon");
  const json: { data: APIAdminLesson } = await response.json();
  return json.data;
}

export const publishAdminLesson = publishLesson;

export function usePublishAdminLesson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => publishLesson(lessonId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", data.moduleId] });
    },
  });
}