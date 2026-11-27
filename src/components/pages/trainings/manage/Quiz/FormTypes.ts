import type { QuizMode, QuizQuestion, QuizQuestionType } from "@/data/quizzes";

export interface QuizFormValues {
  mode: QuizMode;
  time_limit_sec: string;
  pass_score: string;
  max_attempts: string;
  auto_submit_on_timeout: boolean;
}

export const EMPTY_QUIZ_FORM: QuizFormValues = {
  mode: "quiz",
  time_limit_sec: "600",
  pass_score: "80",
  max_attempts: "3",
  auto_submit_on_timeout: true,
};

export function quizFormValuesForMode(mode: QuizMode): QuizFormValues {
  return {
    ...EMPTY_QUIZ_FORM,
    mode,
    time_limit_sec: mode === "quiz" ? "600" : "",
    pass_score: mode === "exercise" ? "70" : "80",
    max_attempts: mode === "exercise" ? "5" : "3",
    auto_submit_on_timeout: mode === "quiz",
  };
}

export interface QuestionFormValues {
  prompt: string;
  type: QuizQuestionType;
  points: string;
  sort_order: string;
  explanation: string;
  choices: { label: string; is_correct: boolean }[];
}

export const EMPTY_QUESTION_FORM: QuestionFormValues = {
  prompt: "",
  type: "single",
  points: "10",
  sort_order: "0",
  explanation: "",
  choices: [
    { label: "", is_correct: false },
    { label: "", is_correct: false },
  ],
};

export interface QuestionDialogState {
  open: boolean;
  row?: QuizQuestion;
}
