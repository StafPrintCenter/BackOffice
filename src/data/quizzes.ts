import type { ContentStatus } from "@/data/trainingModules";

export type QuizMode = "quiz" | "exercise";
export type QuizQuestionType = "single" | "multiple";

export const QUIZ_MODE_LABELS: Record<QuizMode, string> = {
  quiz: "Quiz (chronométré)",
  exercise: "Exercice (libre)",
};

export const QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  single: "Choix unique",
  multiple: "Choix multiples",
};

export interface QuizChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: QuizQuestionType;
  points: number;
  sortOrder: number;
  explanation: string | null;
  choices: QuizChoice[];
}

// ⚠️ Le quiz partage le même enum de statut que module/leçon (ContentStatus), pas un
// enum séparé — confirmé par ContentReviewableType::MAP qui inclut désormais Quiz.
export type APIAdminQuiz = {
  id: string;
  lessonId: string;
  mode: QuizMode;
  timeLimitSec: number | null;
  passScore: number;
  maxAttempts: number;
  totalPoints: number;
  autoSubmitOnTimeout: boolean;
  status: ContentStatus;
  questionsCount: number;
  createdByAdmin?: string | null;
  createdByInstructor?: string | null;
  createdAt: string;
};

export type APIAdminQuizDetail = APIAdminQuiz & {
  questions: QuizQuestion[];
};

export interface AdminQuizPayload {
  mode: QuizMode;
  time_limit_sec?: number; // obligatoire si mode = "quiz"
  pass_score: number;
  max_attempts: number;
  auto_submit_on_timeout?: boolean;
}

export interface AdminQuizChoiceInput {
  label: string;
  is_correct: boolean;
}

export interface AdminQuizQuestionPayload {
  prompt: string;
  type: QuizQuestionType;
  points: number;
  sort_order?: number;
  explanation?: string;
  choices: AdminQuizChoiceInput[];
}
