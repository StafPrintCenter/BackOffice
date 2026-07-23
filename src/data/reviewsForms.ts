export type ReviewFormStatus = "draft" | "published" | "disabled" | string;

/** Le détail des règles (validationRules/options/settings) n'est pas entièrement documenté par les exemples
 *  fournis (aucune valeur peuplée observée pour `options`) — typé de façon permissive en attendant confirmation. */
export interface AdminReviewFormQuestion {
  id: string;
  type: string; // ex: "short_text", "long_text", "file"...
  title: string;
  description: string | null;
  order: number;
  isRequired: boolean;
  validationRules: Record<string, unknown> | null;
  options: unknown[] | null;
  settings: Record<string, unknown> | null;
}

export type APIAdminReviewFormListItem = {
  id: string;
  title: string;
  description: string;
  allowResponseEdit: boolean;
  categoryId: string | null;
  category: string | null;
  status: ReviewFormStatus;
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