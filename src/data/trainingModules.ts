export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";
export type ContentReviewDecision = "approved" | "rejected";
export type LessonKind = "video" | "reading" | "quiz" | "exercise" | "assignment" | "project";

export const LESSON_KIND_LABELS: Record<LessonKind, string> = {
  video: "Vidéo",
  reading: "Lecture",
  quiz: "Quiz",
  exercise: "Exercice",
  assignment: "Devoir à rendre",
  project: "Projet",
};

export type APIAdminTrainingModule = {
  id: string;
  trainingId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isEnabled: boolean;
  status: ContentStatus;
  createdByAdmin?: string | null;
  createdByInstructor?: string | null;
  lessonsCount: number;
  createdAt: string;
};

export interface AdminTrainingModulePayload {
  title: string;
  description?: string;
  sort_order?: number;
  is_enabled?: boolean;
}

export type APIAdminLesson = {
  id: string;
  moduleId: string;
  title: string;
  sortOrder: number;
  durationMinutes: number | null;
  kind: LessonKind;
  content: string | null;
  videoUrl: string | null;
  chapters: string | null;
  brief: string | null;
  isMandatory: boolean;
  status: LessonStatus;
  createdByAdmin?: string | null;
  createdByInstructor?: string | null;
  createdAt: string;
};

export interface AdminLessonPayload {
  title: string;
  kind: LessonKind;
  sort_order?: number;
  duration_minutes?: number;
  content?: string;
  video_url?: string;
  chapters?: string;
  brief?: string;
  is_mandatory?: boolean;
}

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
};

export const MODULE_STATUS_BADGES: Record<ModuleStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
  draft: "Brouillon",
  pending_review: "En attente de validation",
  published: "Publiée",
};

export const LESSON_STATUS_BADGES: Record<LessonStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  pending_review: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export function getModuleStatusBadge(status: ModuleStatus): string {
  return MODULE_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}

export function getLessonStatusBadge(status: LessonStatus): string {
  return LESSON_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}