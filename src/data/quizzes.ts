export type QuizMode = "quiz" | "exercise";
export type QuizQuestionType = "single" | "multiple";
export type QuizStatus = "draft" | "published";

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

// Réponse de création et de mise à jour
export type APIAdminQuiz = {
  id: string;
  lessonId: string;
  mode: QuizMode;
  timeLimitSec: number | null;
  passScore: number;
  maxAttempts: number;
  totalPoints: number;
  autoSubmitOnTimeout: boolean;
  status: QuizStatus;
  questionsCount: number;
  createdByAdmin?: string | null;
  createdByInstructor?: string | null;
  createdAt: string;
};

// Réponse du détail (GET /quizzes/{id}) — inclut les questions complètes.
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

export const QUIZ_STATUS_BADGES: Record<QuizStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20" },
  published: { label: "Publié", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
};

export function getQuizStatusBadgeClass(status: QuizStatus): string {
  return QUIZ_STATUS_BADGES[status]?.className ?? "bg-muted text-muted-foreground border-border";
}

export function getQuizStatusLabel(status: QuizStatus): string {
  return QUIZ_STATUS_BADGES[status]?.label ?? status;
}