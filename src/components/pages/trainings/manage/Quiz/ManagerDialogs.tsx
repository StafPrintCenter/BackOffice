import type { Dispatch, SetStateAction } from "react";
import { ConfirmDelete } from "@/components/site";
import { QuestionEditorDialog } from "../QuestionEditorDialog";
import { QuizSettingsDialog } from "./SettingsDialog";
import type {
  QuestionDialogState,
  QuestionFormValues,
  QuizFormValues,
} from "./FormTypes";
import type { QuizQuestion } from "@/data/quizzes";

interface QuizManagerDialogsProps {
  quizDialog: boolean;
  quizId: string | null;
  quizForm: QuizFormValues;
  setQuizForm: Dispatch<SetStateAction<QuizFormValues>>;
  quizError: string;
  quizPending: boolean;
  onQuizDialogChange: (open: boolean) => void;
  onQuizSubmit: () => void;
  questionDialog: QuestionDialogState;
  questionForm: QuestionFormValues;
  setQuestionForm: Dispatch<SetStateAction<QuestionFormValues>>;
  questionErrors: Record<string, string>;
  questionPending: boolean;
  onQuestionDialogChange: (open: boolean) => void;
  onQuestionSubmit: () => void;
  quizToDelete: boolean;
  onQuizDeleteDialogChange: (open: boolean) => void;
  onQuizDelete: () => void;
  questionToDelete: QuizQuestion | null;
  onQuestionDeleteDialogChange: (open: boolean) => void;
  onQuestionDelete: () => void;
}

export function QuizManagerDialogs({
  quizDialog,
  quizId,
  quizForm,
  setQuizForm,
  quizError,
  quizPending,
  onQuizDialogChange,
  onQuizSubmit,
  questionDialog,
  questionForm,
  setQuestionForm,
  questionErrors,
  questionPending,
  onQuestionDialogChange,
  onQuestionSubmit,
  quizToDelete,
  onQuizDeleteDialogChange,
  onQuizDelete,
  questionToDelete,
  onQuestionDeleteDialogChange,
  onQuestionDelete,
}: QuizManagerDialogsProps) {
  return (
    <>
      <QuizSettingsDialog
        open={quizDialog}
        quizId={quizId}
        form={quizForm}
        setForm={setQuizForm}
        error={quizError}
        isPending={quizPending}
        onOpenChange={onQuizDialogChange}
        onSubmit={onQuizSubmit}
      />
      <QuestionEditorDialog
        dialog={questionDialog}
        form={questionForm}
        setForm={setQuestionForm}
        errors={questionErrors}
        isPending={questionPending}
        onOpenChange={onQuestionDialogChange}
        onSubmit={onQuestionSubmit}
      />
      <ConfirmDelete
        open={quizToDelete}
        onOpenChange={onQuizDeleteDialogChange}
        onConfirm={onQuizDelete}
        title="Supprimer ce quiz et toutes ses questions ?"
      />
      <ConfirmDelete
        open={!!questionToDelete}
        onOpenChange={onQuestionDeleteDialogChange}
        onConfirm={onQuestionDelete}
        title={`Supprimer la question "${questionToDelete?.prompt}" ?`}
      />
    </>
  );
}
