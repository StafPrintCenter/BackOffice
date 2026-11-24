import { CheckCircle2, Pencil, Rocket, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUIZ_MODE_LABELS } from "@/data/quizzes";
import type { APIAdminQuizDetail, QuizQuestion } from "@/data/quizzes";
import { getContentStatusBadgeClass, getContentStatusLabel } from "@/data/trainingModules";
import { QuizQuestionsSection } from "./QuizQuestionsSection";

interface QuizContentProps {
  quiz: APIAdminQuizDetail;
  publishPending: boolean;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onReview: (decision: "approved" | "rejected") => void;
  onCreateQuestion: () => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDeleteQuestion: (question: QuizQuestion) => void;
}

export function QuizContent({
  quiz,
  publishPending,
  onEdit,
  onPublish,
  onDelete,
  onReview,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
}: QuizContentProps) {
  return (
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
        <Button type="button" size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier les réglages
        </Button>

        {quiz.status === "pending_review" && (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => onReview("approved")}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approuver
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onReview("rejected")}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" /> Rejeter
            </Button>
          </>
        )}

        {quiz.status !== "published" && quiz.status !== "pending_review" && (
          <Button type="button" size="sm" variant="ghost" onClick={onPublish} disabled={publishPending || quiz.questionsCount === 0}>
            <Rocket className="mr-1 h-3.5 w-3.5" /> Publier
          </Button>
        )}

        <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer le quiz
        </Button>
      </div>

      <QuizQuestionsSection
        questions={quiz.questions}
        onCreate={onCreateQuestion}
        onEdit={onEditQuestion}
        onDelete={onDeleteQuestion}
      />
    </div>
  );
}
