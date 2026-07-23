import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { AdminReviewQuestionPayload } from "@/data/reviewsForms";

// On invalide le cache du formulaire parent : il n'existe pas d'endpoint "liste des questions"
// indépendant, les questions ne sont lues qu'à travers le détail du formulaire.
const parentResourceKey = "review-forms";
const basePath = "reviews/questions";

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function createQuestion(formId: string, payload: AdminReviewQuestionPayload) {
  const response = await adminFetch(`/api/admin/${basePath}/${formId}/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout de la question");
  const json = await response.json();
  return json.data;
}

async function updateQuestion(questionId: string, payload: AdminReviewQuestionPayload) {
  const response = await adminFetch(`/api/admin/${basePath}/${questionId}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification de la question");
  const json = await response.json();
  return json.data;
}

async function deleteQuestion(questionId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/${basePath}/${questionId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors de la suppression de la question");
}

/** Format confirmé par ReorderController.php : order = [{"id":"uuid","order":0}, ...] */
async function reorderQuestions(formId: string, orderedItems: { id: string; order: number }[]) {
  const response = await adminFetch(`/api/admin/${basePath}/${formId}/reorder`, {
    method: "PUT",
    body: buildFormData({ order: JSON.stringify(orderedItems) }),
  });
  if (!response.ok) throw new Error("Erreur lors de la réorganisation des questions");
  return response.json();
}

export const createAdminReviewQuestion = createQuestion;
export const updateAdminReviewQuestion = updateQuestion;
export const deleteAdminReviewQuestion = deleteQuestion;
export const reorderAdminReviewQuestions = reorderQuestions;

export function useCreateAdminReviewQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, payload }: { formId: string; payload: AdminReviewQuestionPayload }) => createQuestion(formId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [parentResourceKey] }),
  });
}

export function useUpdateAdminReviewQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: AdminReviewQuestionPayload }) => updateQuestion(questionId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [parentResourceKey] }),
  });
}

export function useDeleteAdminReviewQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [parentResourceKey] }),
  });
}

export function useReorderAdminReviewQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formId, orderedItems }: { formId: string; orderedItems: { id: string; order: number }[] }) => reorderQuestions(formId, orderedItems),
    onSuccess: () => qc.invalidateQueries({ queryKey: [parentResourceKey] }),
  });
}