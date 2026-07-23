export type ReviewFormStatus = "draft" | "published" | "disabled";

export interface ReviewQuestionOption {
  label: string;
  value: string;
}

export interface ReviewQuestionValidationRules {
  max_length?: number;
  min?: number;
  max?: number;
  [key: string]: unknown;
}

export interface ReviewQuestionSettings {
  max_size_kb?: number;
  [key: string]: unknown;
}

export interface AdminReviewFormQuestion {
  id: string;
  type: ReviewQuestionType | string;
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  validationRules: ReviewQuestionValidationRules | null;
  options: ReviewQuestionOption[] | null;
  settings: ReviewQuestionSettings | null;
}

export type APIAdminReviewFormListItem = {
  id: string;
  title: string;
  description: string;
  allowResponseEdit: boolean;
  categoryId: string | null;
  category: string | null;
  status: ReviewFormStatus | string;
  expiresAt: string | null;
  maxResponses: number | null;
  responsesCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminReviewFormDetail = APIAdminReviewFormListItem & {
  questions: AdminReviewFormQuestion[];
};

export interface AdminReviewFormPayload {
  title: string;
  description: string;
  category_id?: string;
  expires_at?: string; // ISO 8601
  max_responses?: number;
  allow_response_edit: boolean;
}

export const REVIEW_FORM_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  published: "Publié",
  disabled: "Désactivé",
};

export const REVIEW_FORM_STATUS_BADGES: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  disabled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function getReviewFormStatusBadge(status: string): string {
  return REVIEW_FORM_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}

export type ReviewQuestionType = | "short_text" | "long_text" | "email" | "phone" | "number" | "date" | "datetime" | "single_choice" | "multiple_choice" | "select" | "rating" | "boolean" | "file";

export const REVIEW_QUESTION_TYPES: ReviewQuestionType[] = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "number",
  "date",
  "datetime",
  "single_choice",
  "multiple_choice",
  "select",
  "rating",
  "boolean",
  "file",
];

export const CHOICE_QUESTION_TYPES: ReviewQuestionType[] = [
  "single_choice",
  "multiple_choice",
  "select",
];

export const REVIEW_QUESTION_TYPE_LABELS: Record<string, string> = {
  short_text: "Texte court",
  long_text: "Texte long",
  email: "Adresse e-mail",
  phone: "Téléphone",
  number: "Nombre",
  date: "Date",
  datetime: "Date et heure",
  single_choice: "Choix unique (Boutons)",
  multiple_choice: "Choix multiple (Cases à cocher)",
  select: "Liste déroulante",
  rating: "Note / Évaluation",
  boolean: "Oui / Non",
  file: "Fichier / Pièce jointe",
};

export const REVIEW_QUESTION_TYPE_BADGES: Record<string, string> = {
  short_text: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  long_text: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  email: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  phone: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  number: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  date: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  datetime: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  single_choice: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  multiple_choice: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  select: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
  rating: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  boolean: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  file: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export function getReviewQuestionTypeBadge(type: string): string {
  return REVIEW_QUESTION_TYPE_BADGES[type] ?? "bg-muted text-muted-foreground border-transparent";
}

export interface AdminReviewQuestionPayload {
  type: ReviewQuestionType;
  title: string;
  description?: string;
  order: number;
  is_required: boolean;
  validation_rules?: string;
  options?: string;
  settings?: string;
}

export interface AdminReviewFormAnalyticsQuestion {
  questionId: string;
  title: string;
  type: string;
  responses: number;
}

export interface AdminReviewFormAnalytics {
  formId: string;
  totalResponses: number;
  questions: AdminReviewFormAnalyticsQuestion[];
}