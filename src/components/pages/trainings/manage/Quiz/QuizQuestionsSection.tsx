import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { QUESTION_TYPE_LABELS } from "@/data/quizzes";
import type { QuizQuestion } from "@/data/quizzes";

interface QuizQuestionsSectionProps {
  questions: QuizQuestion[];
  onCreate: () => void;
  onEdit: (question: QuizQuestion) => void;
  onDelete: (question: QuizQuestion) => void;
}

export function QuizQuestionsSection({
  questions,
  onCreate,
  onEdit,
  onDelete,
}: QuizQuestionsSectionProps) {
  return (
    <div className="border-t pt-3">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Questions ({questions.length})</Label>
        <Button type="button" size="sm" variant="outline" onClick={onCreate}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une question
        </Button>
      </div>
      {questions.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucune question. Le quiz ne peut pas être publié sans question.</p>
      ) : (
        <div className="space-y-2">
          {[...questions].sort((a, b) => a.sortOrder - b.sortOrder).map((question) => (
            <div key={question.id} className="rounded-lg border p-3 text-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{question.prompt}</div>
                  <div className="mt-0.5 text-muted-foreground">
                    {QUESTION_TYPE_LABELS[question.type]} · {question.points} pts
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(question)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(question)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {question.choices.map((choice) => (
                  <li key={choice.id} className="flex items-center gap-1.5">
                    {choice.isCorrect
                      ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                      : <span className="h-3 w-3 shrink-0" />}
                    <span className={choice.isCorrect ? "font-medium text-emerald-700" : "text-muted-foreground"}>
                      {choice.label}
                    </span>
                  </li>
                ))}
              </ul>
              {question.explanation && <p className="mt-2 text-muted-foreground italic">{question.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
