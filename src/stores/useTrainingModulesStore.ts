import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type {
  APIAdminTrainingModule, AdminTrainingModulePayload, APIAdminLesson,
} from "@/data/trainingModules";

// Modules : liste/création imbriquées sous /trainings/{trainingId}/modules,
// mais detail/update/delete/publish sur routes PLATES /admin/modules/{id}.
// Aucun des deux schémas ne correspond au basePath fixe de createResourceStore → store manuel.

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, value === null ? "" : String(value));
    }
  }
  return fd;
}

/* ---- Liste des modules d'une formation ---- */

async function fetchTrainingModules(trainingId: string): Promise<APIAdminTrainingModule[]> {
  const response = await adminFetch(`/api/admin/trainings/${trainingId}/modules/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des modules");
  const json: { data: APIAdminTrainingModule[] } = await response.json();
  return json.data;
}

export function useTrainingModulesList(trainingId: string | undefined) {
  const query = useQuery({
    queryKey: ["training-modules", trainingId],
    queryFn: () => fetchTrainingModules(trainingId as string),
    enabled: !!trainingId,
  });
  return { modules: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Création d'un module ---- */

async function createModule(trainingId: string, payload: AdminTrainingModulePayload): Promise<APIAdminTrainingModule> {
  const response = await adminFetch(`/api/admin/trainings/${trainingId}/modules/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la création du module");
  const json: { data: APIAdminTrainingModule } = await response.json();
  return json.data;
}

export const createAdminTrainingModule = createModule;

export function useCreateAdminTrainingModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trainingId, payload }: { trainingId: string; payload: AdminTrainingModulePayload }) =>
      createModule(trainingId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["training-modules", variables.trainingId] });
    },
  });
}

/* ---- Détail d'un module (+ ses leçons, clé sœur de "data") ---- */

export interface ModuleDetailWithLessons {
  module: APIAdminTrainingModule;
  lessons: APIAdminLesson[];
}

async function fetchModuleDetail(moduleId: string): Promise<ModuleDetailWithLessons> {
  const response = await adminFetch(`/api/admin/modules/${moduleId}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération du module");
  const json: { data: APIAdminTrainingModule; lessons: APIAdminLesson[] } = await response.json();
  return { module: json.data, lessons: json.lessons ?? [] };
}

export function useAdminModuleDetail(moduleId: string | undefined) {
  const query = useQuery({
    queryKey: ["training-modules", "detail", moduleId],
    queryFn: () => fetchModuleDetail(moduleId as string),
    enabled: !!moduleId,
  });
  return {
    module: query.data?.module ?? null,
    lessons: query.data?.lessons ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

/* ---- Update / delete / publish d'un module ---- */

async function updateModule(moduleId: string, payload: AdminTrainingModulePayload): Promise<APIAdminTrainingModule> {
  const response = await adminFetch(`/api/admin/modules/${moduleId}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification du module");
  const json: { data: APIAdminTrainingModule } = await response.json();
  return json.data;
}

export const updateAdminTrainingModule = updateModule;

export function useUpdateAdminTrainingModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: AdminTrainingModulePayload }) =>
      updateModule(moduleId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["training-modules", data.trainingId] });
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", data.id] });
    },
  });
}

async function deleteModule(moduleId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/modules/${moduleId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors de la suppression du module");
}

export const deleteAdminTrainingModule = deleteModule;

// On passe trainingId en entrée pour invalider le bon cache de liste (non extrait de la réponse DELETE).
export function useDeleteAdminTrainingModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId }: { trainingId: string; moduleId: string }) => deleteModule(moduleId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["training-modules", variables.trainingId] });
    },
  });
}

async function publishModule(moduleId: string): Promise<APIAdminTrainingModule> {
  const response = await adminFetch(`/api/admin/modules/${moduleId}/publish`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la publication du module");
  const json: { data: APIAdminTrainingModule } = await response.json();
  return json.data;
}

export const publishAdminTrainingModule = publishModule;

export function usePublishAdminTrainingModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleId: string) => publishModule(moduleId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["training-modules", data.trainingId] });
      qc.invalidateQueries({ queryKey: ["training-modules", "detail", data.id] });
    },
  });
}