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
  chapters: string[] | null;
  brief: string | null;
  isMandatory: boolean;
  status: ContentStatus;
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

export const CONTENT_STATUS_BADGES: Record<ContentStatus, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  pending_review: {
    label: "En attente de validation",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  published: {
    label: "Publié",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejeté",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function getContentStatusBadgeClass(status: ContentStatus): string {
  return CONTENT_STATUS_BADGES[status]?.className ?? "bg-muted text-muted-foreground border-border";
}

export function getContentStatusLabel(status: ContentStatus): string {
  return CONTENT_STATUS_BADGES[status]?.label ?? status;
}