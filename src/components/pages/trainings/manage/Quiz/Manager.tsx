import { useState } from "react";
import { toast } from "sonner";
import { HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminQuizDetail, useCreateAdminQuiz, useUpdateAdminQuiz, useDeleteAdminQuiz, usePublishAdminQuiz } from "@/stores/useQuizzesStore";
import type { AdminQuizPayload, QuizMode } from "@/data/quizzes";
import { QuizContent } from "./Content";
import { QuizManagerDialogs } from "./ManagerDialogs";
import { EMPTY_QUIZ_FORM, type QuizFormValues } from "./FormTypes";
import { useQuizQuestionManager } from "../Utility/useQuizQuestionManager";

export function QuizManager({
  lessonId,
  mode,
  quizId,
  onQuizCreated,
  openReview,
}: {
  lessonId: string;
  mode: QuizMode;
  quizId: string | null;
  onQuizCreated: (id: string) => void;
  openReview: (type: "module" | "lesson" | "quiz", id: string, title: string, decision: "approved" | "rejected") => void;
}) {
  const { quiz, isLoading } = useAdminQuizDetail(quizId ?? undefined);
  const questionManager = useQuizQuestionManager(quizId, quiz?.questions.length ?? 0);
  const createQuizMutation = useCreateAdminQuiz();
  const updateQuizMutation = useUpdateAdminQuiz();
  const deleteQuizMutation = useDeleteAdminQuiz();
  const publishQuizMutation = usePublishAdminQuiz();

  const [quizDialog, setQuizDialog] = useState(false);
  const [quizForm, setQuizForm] = useState<QuizFormValues>(EMPTY_QUIZ_FORM);
  const [quizError, setQuizError] = useState("");
  const [quizToDelete, setQuizToDelete] = useState(false);

  const openCreateQuiz = () => {
    setQuizForm({ ...EMPTY_QUIZ_FORM, mode });
    setQuizError("");
    setQuizDialog(true);
  };

  const openEditQuiz = () => {
    if (!quiz) return;
    setQuizForm({
      mode,
      time_limit_sec: quiz.timeLimitSec != null ? String(quiz.timeLimitSec) : "",
      pass_score: String(quiz.passScore),
      max_attempts: String(quiz.maxAttempts),
      auto_submit_on_timeout: quiz.autoSubmitOnTimeout,
    });
    setQuizError("");
    setQuizDialog(true);
  };

  const submitQuiz = () => {
    if (mode === "quiz" && !quizForm.time_limit_sec.trim()) {
      setQuizError("La durée limite est requise en mode Quiz chronométré");
      return;
    }
    setQuizError("");

    const payload: AdminQuizPayload = {
      mode,
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
          onCreateQuestion={questionManager.openCreate}
          onEditQuestion={questionManager.openEdit}
          onDeleteQuestion={questionManager.setQuestionToDelete}
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
        questionDialog={questionManager.dialog}
        questionForm={questionManager.form}
        setQuestionForm={questionManager.setForm}
        questionErrors={questionManager.errors}
        questionPending={questionManager.isSaving}
        onQuestionDialogChange={questionManager.onDialogChange}
        onQuestionSubmit={questionManager.submit}
        quizToDelete={quizToDelete}
        onQuizDeleteDialogChange={setQuizToDelete}
        onQuizDelete={confirmDeleteQuiz}
        questionToDelete={questionManager.questionToDelete}
        onQuestionDeleteDialogChange={(open) => !open && questionManager.setQuestionToDelete(null)}
        onQuestionDelete={questionManager.confirmDelete}
      />
    </div>
  );
}