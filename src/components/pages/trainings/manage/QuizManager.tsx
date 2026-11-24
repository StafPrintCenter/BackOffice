import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Rocket, HelpCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmDelete } from "@/components/site";
import {
  useAdminQuizDetail, useCreateAdminQuiz, useUpdateAdminQuiz, useDeleteAdminQuiz, usePublishAdminQuiz,
  useCreateAdminQuizQuestion, useUpdateAdminQuizQuestion, useDeleteAdminQuizQuestion,
} from "@/stores/useQuizzesStore";
import { QUIZ_MODE_LABELS, QUESTION_TYPE_LABELS } from "@/data/quizzes";
import type { QuizQuestion, AdminQuizPayload, AdminQuizQuestionPayload } from "@/data/quizzes";
import { getContentStatusBadgeClass, getContentStatusLabel } from "@/data/trainingModules";
import { QuestionEditorDialog } from "./QuestionEditorDialog";
import { QuizSettingsDialog } from "./QuizSettingsDialog";
import {
  EMPTY_QUESTION_FORM,
  EMPTY_QUIZ_FORM,
  type QuestionDialogState,
  type QuestionFormValues,
  type QuizFormValues,
} from "./quiz-form-types";

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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${getContentStatusBadgeClass(quiz.status)}`}>
              {getContentStatusLabel(quiz.status)}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5">{QUIZ_MODE_LABELS[quiz.mode]}</span>
            {quiz.timeLimitSec != null && <span className="rounded-full bg-muted px-2 py-0.5">{quiz.timeLimitSec}s</span>}
            <span className="rounded-full bg-muted px-2 py-0.5">Seuil {quiz.passScore}%</span>
            <span className="rounded-full bg-muted px-2 py-0.5">{quiz.maxAttempts} tentative{quiz.maxAttempts > 1 ? "s" : ""}</span>
            <span className="rounded-full bg-muted px-2 py-0.5">{quiz.totalPoints} pts total</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={openEditQuiz}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier les réglages
            </Button>

            {quiz.status === "pending_review" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-emerald-600 hover:bg-emerald-500/10"
                  onClick={() => openReview("quiz", quiz.id, `Quiz de la leçon`, "approved")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => openReview("quiz", quiz.id, `Quiz de la leçon`, "rejected")}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                </Button>
              </>
            )}

            {quiz.status !== "published" && quiz.status !== "pending_review" && (
              <Button type="button" size="sm" variant="ghost" onClick={handlePublishQuiz} disabled={publishQuizMutation.isPending || quiz.questionsCount === 0}>
                <Rocket className="h-3.5 w-3.5 mr-1" /> Publier
              </Button>
            )}

            <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setQuizToDelete(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Supprimer le quiz
            </Button>
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Questions ({quiz.questions.length})</Label>
              <Button type="button" size="sm" variant="outline" onClick={openCreateQuestion}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une question
              </Button>
            </div>
            {quiz.questions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune question. Le quiz ne peut pas être publié sans question.</p>
            ) : (
              <div className="space-y-2">
                {[...quiz.questions].sort((a, b) => a.sortOrder - b.sortOrder).map((q) => (
                  <div key={q.id} className="rounded-lg border p-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{q.prompt}</div>
                        <div className="mt-0.5 text-muted-foreground">
                          {QUESTION_TYPE_LABELS[q.type]} · {q.points} pts
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEditQuestion(q)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setQuestionToDelete(q)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {q.choices.map((c) => (
                        <li key={c.id} className="flex items-center gap-1.5">
                          {c.isCorrect ? <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" /> : <span className="h-3 w-3 shrink-0" />}
                          <span className={c.isCorrect ? "text-emerald-700 font-medium" : "text-muted-foreground"}>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="mt-2 text-muted-foreground italic">{q.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <QuizSettingsDialog
        open={quizDialog}
        quizId={quizId}
        form={quizForm}
        setForm={setQuizForm}
        error={quizError}
        isPending={createQuizMutation.isPending || updateQuizMutation.isPending}
        onOpenChange={setQuizDialog}
        onSubmit={submitQuiz}
      />
      <QuestionEditorDialog
        dialog={questionDialog}
        form={questionForm}
        setForm={setQuestionForm}
        errors={questionErrors}
        isPending={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        onOpenChange={(open) => setQuestionDialog({ open })}
        onSubmit={submitQuestion}
      />

      <ConfirmDelete
        open={quizToDelete}
        onOpenChange={setQuizToDelete}
        onConfirm={() => {
          if (!quizId) return;
          deleteQuizMutation.mutate(
            { lessonId, quizId },
            {
              onSuccess: () => { toast.success("Quiz supprimé"); setQuizToDelete(false); },
              onError: () => toast.error("Erreur lors de la suppression du quiz"),
            }
          );
        }}
        title="Supprimer ce quiz et toutes ses questions ?"
      />

      <ConfirmDelete
        open={!!questionToDelete}
        onOpenChange={(v) => !v && setQuestionToDelete(null)}
        onConfirm={() => {
          if (!questionToDelete || !quizId) return;
          deleteQuestionMutation.mutate(
            { questionId: questionToDelete.id, quizId },
            {
              onSuccess: () => { toast.success("Question supprimée"); setQuestionToDelete(null); },
              onError: () => toast.error("Erreur lors de la suppression de la question"),
            }
          );
        }}
        title={`Supprimer la question "${questionToDelete?.prompt}" ?`}
      />
    </div>
  );
}