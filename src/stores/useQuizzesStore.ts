import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { APIAdminQuiz, APIAdminQuizDetail, AdminQuizPayload, AdminQuizQuestionPayload, QuizQuestion } from "@/data/quizzes";

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

/* ---- Création du quiz sur une leçon ---- */

async function createQuiz(lessonId: string, payload: AdminQuizPayload): Promise<APIAdminQuiz> {
  const response = await adminFetch(`/api/admin/lessons/${lessonId}/quiz/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la création du quiz");
  const json: { data: APIAdminQuiz } = await response.json();
  return json.data;
}

export const createAdminQuiz = createQuiz;

export function useCreateAdminQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: AdminQuizPayload }) => createQuiz(lessonId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "by-lesson", variables.lessonId] });
    },
  });
}

/* ---- Détail (route plate) ---- */

async function fetchQuizDetail(quizId: string): Promise<APIAdminQuizDetail> {
  const response = await adminFetch(`/api/admin/quizzes/${quizId}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération du quiz");
  const json: { data: APIAdminQuizDetail } = await response.json();
  return json.data;
}

export function useAdminQuizDetail(quizId: string | undefined) {
  const query = useQuery({
    queryKey: ["quizzes", "detail", quizId],
    queryFn: () => fetchQuizDetail(quizId as string),
    enabled: !!quizId,
  });
  return { quiz: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

/* ---- Update / delete / publish ---- */

async function updateQuiz(quizId: string, payload: AdminQuizPayload): Promise<APIAdminQuiz> {
  const response = await adminFetch(`/api/admin/quizzes/${quizId}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification du quiz");
  const json: { data: APIAdminQuiz } = await response.json();
  return json.data;
}

export const updateAdminQuiz = updateQuiz;

export function useUpdateAdminQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: AdminQuizPayload }) => updateQuiz(quizId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "detail", data.id] });
      qc.invalidateQueries({ queryKey: ["quizzes", "by-lesson", data.lessonId] });
    },
  });
}

async function deleteQuiz(quizId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/quizzes/${quizId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors de la suppression du quiz");
}

export const deleteAdminQuiz = deleteQuiz;

export function useDeleteAdminQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId }: { lessonId: string; quizId: string }) => deleteQuiz(quizId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "by-lesson", variables.lessonId] });
    },
  });
}

async function publishQuiz(quizId: string): Promise<APIAdminQuiz> {
  const response = await adminFetch(`/api/admin/quizzes/${quizId}/publish`, { method: "PUT" });
  if (!response.ok) throw new Error("Erreur lors de la publication du quiz — le quiz doit avoir au moins une question");
  const json: { data: APIAdminQuiz } = await response.json();
  return json.data;
}

export const publishAdminQuiz = publishQuiz;

export function usePublishAdminQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => publishQuiz(quizId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "detail", data.id] });
      qc.invalidateQueries({ queryKey: ["quizzes", "by-lesson", data.lessonId] });
    },
  });
}

/* ---- Questions (routes plates, imbriquées seulement pour la création) ---- */

async function createQuestion(quizId: string, payload: AdminQuizQuestionPayload): Promise<QuizQuestion> {
  const response = await adminFetch(`/api/admin/quizzes/${quizId}/questions/create`, {
    method: "POST",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout de la question");
  const json: { data: QuizQuestion } = await response.json();
  return json.data;
}

export const createAdminQuizQuestion = createQuestion;

export function useCreateAdminQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: AdminQuizQuestionPayload }) => createQuestion(quizId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "detail", variables.quizId] });
    },
  });
}

async function updateQuestion(questionId: string, payload: AdminQuizQuestionPayload): Promise<QuizQuestion> {
  const response = await adminFetch(`/api/admin/questions/${questionId}`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error("Erreur lors de la modification de la question");
  const json: { data: QuizQuestion } = await response.json();
  return json.data;
}

export const updateAdminQuizQuestion = updateQuestion;

export function useUpdateAdminQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; quizId: string; payload: AdminQuizQuestionPayload }) =>
      updateQuestion(questionId, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "detail", variables.quizId] });
    },
  });
}

async function deleteQuestion(questionId: string): Promise<void> {
  const response = await adminFetch(`/api/admin/questions/${questionId}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error("Erreur lors de la suppression de la question");
}

export const deleteAdminQuizQuestion = deleteQuestion;

export function useDeleteAdminQuizQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId }: { questionId: string; quizId: string }) => deleteQuestion(questionId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["quizzes", "detail", variables.quizId] });
    },
  });
}