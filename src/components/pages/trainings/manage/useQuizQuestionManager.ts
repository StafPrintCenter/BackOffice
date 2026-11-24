import { useState } from "react";
import { toast } from "sonner";
import type { AdminQuizQuestionPayload, QuizQuestion } from "@/data/quizzes";
import {
  useCreateAdminQuizQuestion,
  useDeleteAdminQuizQuestion,
  useUpdateAdminQuizQuestion,
} from "@/stores/useQuizzesStore";
import {
  EMPTY_QUESTION_FORM,
  type QuestionDialogState,
  type QuestionFormValues,
} from "./QuizFormTypes";

export function useQuizQuestionManager(quizId: string | null, questionCount: number) {
  const createMutation = useCreateAdminQuizQuestion();
  const updateMutation = useUpdateAdminQuizQuestion();
  const deleteMutation = useDeleteAdminQuizQuestion();
  const [dialog, setDialog] = useState<QuestionDialogState>({ open: false });
  const [form, setForm] = useState<QuestionFormValues>(EMPTY_QUESTION_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);

  const openCreate = () => {
    setForm({ ...EMPTY_QUESTION_FORM, sort_order: String(questionCount) });
    setErrors({});
    setDialog({ open: true });
  };

  const openEdit = (question: QuizQuestion) => {
    setForm({
      prompt: question.prompt,
      type: question.type,
      points: String(question.points),
      sort_order: String(question.sortOrder),
      explanation: question.explanation ?? "",
      choices: question.choices.length > 0
        ? [...question.choices]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((choice) => ({ label: choice.label, is_correct: choice.isCorrect }))
        : [{ label: "", is_correct: false }, { label: "", is_correct: false }],
    });
    setErrors({});
    setDialog({ open: true, row: question });
  };

  const submit = () => {
    if (!form.prompt.trim()) {
      setErrors({ prompt: "L'énoncé est requis" });
      return;
    }

    const choices = form.choices.filter((choice) => choice.label.trim());
    if (choices.length < 2) {
      setErrors({ choices: "Ajoutez au moins deux options" });
      return;
    }
    if (!choices.some((choice) => choice.is_correct)) {
      setErrors({ choices: "Marquez au moins une réponse correcte" });
      return;
    }
    if (!quizId) return;

    setErrors({});
    const payload: AdminQuizQuestionPayload = {
      prompt: form.prompt.trim(),
      type: form.type,
      points: Number(form.points),
      sort_order: Number(form.sort_order),
      explanation: form.explanation.trim() || undefined,
      choices: choices.map((choice) => ({ label: choice.label.trim(), is_correct: choice.is_correct })),
    };

    if (dialog.row) {
      updateMutation.mutate(
        { questionId: dialog.row.id, quizId, payload },
        {
          onSuccess: () => { toast.success("Question modifiée"); setDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la modification de la question"),
        }
      );
    } else {
      createMutation.mutate(
        { quizId, payload },
        {
          onSuccess: () => { toast.success("Question ajoutée"); setDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de l'ajout de la question"),
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!questionToDelete || !quizId) return;
    deleteMutation.mutate(
      { questionId: questionToDelete.id, quizId },
      {
        onSuccess: () => { toast.success("Question supprimée"); setQuestionToDelete(null); },
        onError: () => toast.error("Erreur lors de la suppression de la question"),
      }
    );
  };

  const onDialogChange = (open: boolean) => setDialog({ open });

  return {
    dialog,
    form,
    setForm,
    errors,
    questionToDelete,
    setQuestionToDelete,
    isSaving: createMutation.isPending || updateMutation.isPending,
    openCreate,
    openEdit,
    submit,
    onDialogChange,
    confirmDelete,
  };
}
