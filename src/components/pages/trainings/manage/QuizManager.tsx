import { useState } from "react";
import { toast } from "sonner";
import { HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminQuizDetail, useCreateAdminQuiz, useUpdateAdminQuiz, useDeleteAdminQuiz, usePublishAdminQuiz,
  useCreateAdminQuizQuestion, useUpdateAdminQuizQuestion, useDeleteAdminQuizQuestion,
} from "@/stores/useQuizzesStore";
import type { QuizQuestion, AdminQuizPayload, AdminQuizQuestionPayload } from "@/data/quizzes";
import { QuizContent } from "./QuizContent";
import { QuizManagerDialogs } from "./QuizManagerDialogs";
import {
  EMPTY_QUESTION_FORM,
  EMPTY_QUIZ_FORM,
  type QuestionDialogState,
  type QuestionFormValues,
  type QuizFormValues,
} from "./QuizFormTypes";

export function QuizManager({
  lessonId,
  quizId,
  onQuizCreated,
  openReview,
}: {
  lessonId: string;
  quizId: string | null;
  onQuizCreated: (id: string) => void;
  openReview: (type: "module" | "lesson" | "quiz", id: string, title: string, decision: "approved" | "rejected") => void;
}) {
  const { quiz, isLoading } = useAdminQuizDetail(quizId ?? undefined);
  const createQuizMutation = useCreateAdminQuiz();
  const updateQuizMutation = useUpdateAdminQuiz();
  const deleteQuizMutation = useDeleteAdminQuiz();
  const publishQuizMutation = usePublishAdminQuiz();
  const createQuestionMutation = useCreateAdminQuizQuestion();
  const updateQuestionMutation = useUpdateAdminQuizQuestion();
  const deleteQuestionMutation = useDeleteAdminQuizQuestion();

  const [quizDialog, setQuizDialog] = useState(false);
  const [quizForm, setQuizForm] = useState<QuizFormValues>(EMPTY_QUIZ_FORM);
  const [quizError, setQuizError] = useState("");
  const [quizToDelete, setQuizToDelete] = useState(false);

  const [questionDialog, setQuestionDialog] = useState<QuestionDialogState>({ open: false });
  const [questionForm, setQuestionForm] = useState<QuestionFormValues>(EMPTY_QUESTION_FORM);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);

  const openCreateQuiz = () => {
    setQuizForm(EMPTY_QUIZ_FORM);
    setQuizError("");
    setQuizDialog(true);
  };

  const openEditQuiz = () => {
    if (!quiz) return;
    setQuizForm({
      mode: quiz.mode,
      time_limit_sec: quiz.timeLimitSec != null ? String(quiz.timeLimitSec) : "",
      pass_score: String(quiz.passScore),
      max_attempts: String(quiz.maxAttempts),
      auto_submit_on_timeout: quiz.autoSubmitOnTimeout,
    });
    setQuizError("");
    setQuizDialog(true);
  };

  const submitQuiz = () => {
    if (quizForm.mode === "quiz" && !quizForm.time_limit_sec.trim()) {
      setQuizError("La durée limite est requise en mode Quiz chronométré");
      return;
    }
    setQuizError("");

    const payload: AdminQuizPayload = {
      mode: quizForm.mode,
      time_limit_sec: quizForm.time_limit_sec ? Number(quizForm.time_limit_sec) : undefined,
      pass_score: Number(quizForm.pass_score),
      max_attempts: Number(quizForm.max_attempts),
      auto_submit_on_timeout: quizForm.auto_submit_on_timeout,
    };

    if (quizId) {
      updateQuizMutation.mutate(
        { quizId, payload },
        {
          onSuccess: () => { toast.success("Quiz modifié"); setQuizDialog(false); },
          onError: () => toast.error("Erreur lors de la modification du quiz"),
        }
      );
    } else {
      createQuizMutation.mutate(
        { lessonId, payload },
        {
          onSuccess: (created) => {
            toast.success("Quiz créé");
            onQuizCreated(created.id);
            setQuizDialog(false);
          },
          onError: () => toast.error("Erreur lors de la création du quiz"),
        }
      );
    }
  };

  const handlePublishQuiz = () => {
    if (!quizId) return;
    publishQuizMutation.mutate(quizId, {
      onSuccess: () => toast.success("Quiz publié"),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur lors de la publication"),
    });
  };

  const openCreateQuestion = () => {
    setQuestionForm({ ...EMPTY_QUESTION_FORM, sort_order: String(quiz?.questions.length ?? 0) });
    setQuestionErrors({});
    setQuestionDialog({ open: true });
  };

  const openEditQuestion = (q: QuizQuestion) => {
    setQuestionForm({
      prompt: q.prompt,
      type: q.type,
      points: String(q.points),
      sort_order: String(q.sortOrder),
      explanation: q.explanation ?? "",
      choices: q.choices.length > 0
        ? [...q.choices].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ label: c.label, is_correct: c.isCorrect }))
        : [{ label: "", is_correct: false }, { label: "", is_correct: false }],
    });
    setQuestionErrors({});
    setQuestionDialog({ open: true, row: q });
  };

  const submitQuestion = () => {
    if (!questionForm.prompt.trim()) {
      setQuestionErrors({ prompt: "L'énoncé est requis" });
      return;
    }
    const cleanChoices = questionForm.choices.filter((c) => c.label.trim());
    if (cleanChoices.length < 2) {
      setQuestionErrors({ choices: "Ajoutez au moins deux options" });
      return;
    }
    if (!cleanChoices.some((c) => c.is_correct)) {
      setQuestionErrors({ choices: "Marquez au moins une réponse correcte" });
      return;
    }
    setQuestionErrors({});

    const payload: AdminQuizQuestionPayload = {
      prompt: questionForm.prompt.trim(),
      type: questionForm.type,
      points: Number(questionForm.points),
      sort_order: Number(questionForm.sort_order),
      explanation: questionForm.explanation.trim() || undefined,
      choices: cleanChoices.map((c) => ({ label: c.label.trim(), is_correct: c.is_correct })),
    };

    if (!quizId) return;

    if (questionDialog.row) {
      updateQuestionMutation.mutate(
        { questionId: questionDialog.row.id, quizId, payload },
        {
          onSuccess: () => { toast.success("Question modifiée"); setQuestionDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la modification de la question"),
        }
      );
    } else {
      createQuestionMutation.mutate(
        { quizId, payload },
        {
          onSuccess: () => { toast.success("Question ajoutée"); setQuestionDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de l'ajout de la question"),
        }
      );
    }
  };

  const confirmDeleteQuiz = () => {
    if (!quizId) return;
    deleteQuizMutation.mutate(
      { lessonId, quizId },
      {
        onSuccess: () => { toast.success("Quiz supprimé"); setQuizToDelete(false); },
        onError: () => toast.error("Erreur lors de la suppression du quiz"),
      }
    );
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete || !quizId) return;
    deleteQuestionMutation.mutate(
      { questionId: questionToDelete.id, quizId },
      {
        onSuccess: () => { toast.success("Question supprimée"); setQuestionToDelete(null); },
        onError: () => toast.error("Erreur lors de la suppression de la question"),
      }
    );
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HelpCircle className="h-4 w-4 text-primary" /> Quiz / Exercice
        </div>
        {!quizId && (
          <Button type="button" size="sm" variant="outline" onClick={openCreateQuiz}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Configurer un quiz
          </Button>
        )}
      </div>

      {!quizId ? (
        <p className="text-xs text-muted-foreground">Aucun quiz configuré pour cette leçon.</p>
      ) : isLoading || !quiz ? (
        <div className="text-xs text-muted-foreground">Chargement du quiz...</div>
      ) : (
        <QuizContent
          quiz={quiz}
          publishPending={publishQuizMutation.isPending}
          onEdit={openEditQuiz}
          onPublish={handlePublishQuiz}
          onDelete={() => setQuizToDelete(true)}
          onReview={(decision) => openReview("quiz", quiz.id, "Quiz de la leçon", decision)}
          onCreateQuestion={openCreateQuestion}
          onEditQuestion={openEditQuestion}
          onDeleteQuestion={setQuestionToDelete}
        />
      )}

      <QuizManagerDialogs
        quizDialog={quizDialog}
        quizId={quizId}
        quizForm={quizForm}
        setQuizForm={setQuizForm}
        quizError={quizError}
        quizPending={createQuizMutation.isPending || updateQuizMutation.isPending}
        onQuizDialogChange={setQuizDialog}
        onQuizSubmit={submitQuiz}
        questionDialog={questionDialog}
        questionForm={questionForm}
        setQuestionForm={setQuestionForm}
        questionErrors={questionErrors}
        questionPending={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        onQuestionDialogChange={(open) => setQuestionDialog({ open })}
        onQuestionSubmit={submitQuestion}
        quizToDelete={quizToDelete}
        onQuizDeleteDialogChange={setQuizToDelete}
        onQuizDelete={confirmDeleteQuiz}
        questionToDelete={questionToDelete}
        onQuestionDeleteDialogChange={(open) => !open && setQuestionToDelete(null)}
        onQuestionDelete={confirmDeleteQuestion}
      />
    </div>
  );
}