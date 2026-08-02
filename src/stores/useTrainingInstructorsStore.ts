import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { APITrainingInstructorAssignment, AdminTrainingInstructorAssignPayload } from "@/data/trainingInstructors";


function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function fetchTrainingInstructors(trainingId: string): Promise<APITrainingInstructorAssignment[]> {
  const response = await adminFetch(`/api/admin/trainings/${trainingId}/instructors/list`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des formateurs assignés");
  const json: { data: APITrainingInstructorAssignment[] } = await response.json();
  return json.data;
}

export function useTrainingInstructorsList(trainingId: string | undefined) {
  const query = useQuery({
    queryKey: ["trainings", "instructors", trainingId],
    queryFn: () => fetchTrainingInstructors(trainingId as string),
    enabled: !!trainingId,
  });
  return { assignments: query.data ?? [], isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

async function assignInstructor(trainingId: string, payload: AdminTrainingInstructorAssignPayload) {
  const response = await adminFetch(`/api/admin/trainings/${trainingId}/instructors/assign`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'assignation du formateur");
  return response.json();
}

export const assignAdminTrainingInstructor = assignInstructor;

export function useAssignAdminTrainingInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trainingId, payload }: { trainingId: string; payload: AdminTrainingInstructorAssignPayload }) =>
      assignInstructor(trainingId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["trainings", "instructors", variables.trainingId] });
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}

async function removeInstructorAssignment(assignmentId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/trainings/instructors/${assignmentId}`, {
    method: "DELETE",
  });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors du retrait du formateur");
}

export const removeAdminTrainingInstructorAssignment = removeInstructorAssignment;

export function useRemoveAdminTrainingInstructorAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assignmentId }: { trainingId: string; assignmentId: string }) =>
      removeInstructorAssignment(assignmentId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["trainings", "instructors", variables.trainingId] });
      qc.invalidateQueries({ queryKey: ["instructors"] });
    },
  });
}
