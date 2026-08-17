import type { LessonKind, ContentStatus, QuizMode } from "@/data/trainingModules";
import type { TrainingLevel, TrainingStatus } from "@/data/trainings";

export type ContentReviewableType = "module" | "lesson" | "quiz";
export type ContentReviewDecision = "approved" | "rejected";

export interface AdminContentReviewPayload {
  reviewable_type: ContentReviewableType;
  reviewable_id: string;
  decision: ContentReviewDecision;
  comment?: string;
}

export interface APIAdminContentReview {
  id: string;
  reviewableType: ContentReviewableType;
  reviewableId: string;
  decision: ContentReviewDecision;
  comment: string | null;
  reviewedAt: string;
}

export const CONTENT_REVIEW_DECISION_LABELS: Record<ContentReviewDecision, string> = {
  approved: "Approuvé",
  rejected: "Rejeté",
};

/* ---- Structure hiérarchique renvoyée par /trainings/content-reviews/pending ---- */
export interface PendingReviewTraining {
  id: string;
  title: string;
  slug: string | null;
  level: TrainingLevel;
  status: TrainingStatus;
  coverColor: string | null;
}

// Structure simplifiée du Quiz rattaché à une leçon
export interface PendingReviewQuiz {
  id: string;
  lessonId: string;
  mode: QuizMode;
  passScore: number | null;
  maxAttempts: number | null;
  timeLimitSec: number | null;
  status: ContentStatus;
  createdByAdmin: string | null;
  createdByInstructor: string | null;
  createdAt: string;
}

// Sous-ensemble de APIAdminLesson : inclut le quiz optionnel
export interface PendingReviewLesson {
  id: string;
  title: string;
  brief: string | null;
  sortOrder: number;
  durationMinutes: number | null;
  kind: LessonKind;
  videoUrl: string | null;
  isMandatory: boolean;
  status: ContentStatus;
  createdByAdmin: string | null;
  createdByInstructor: string | null;
  createdAt: string;
  quiz?: PendingReviewQuiz | null;
}

export interface PendingReviewModule {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
  status: ContentStatus;
  createdByAdmin: string | null;
  createdByInstructor: string | null;
  createdAt: string;
  lessons: PendingReviewLesson[];
}

export interface PendingReviewTrainingGroup {
  training: PendingReviewTraining;
  modules: PendingReviewModule[];
}

export interface PendingReviewLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface PendingReviewsResponse {
  current_page: number;
  data: PendingReviewTrainingGroup[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: PendingReviewLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PendingReviewsParams {
  query?: string;
  sort_by?: "created_at" | "title" | "updated_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}