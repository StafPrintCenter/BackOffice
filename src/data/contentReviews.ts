export type ContentReviewableType = "module" | "lesson";
export type ContentReviewDecision = "approved" | "rejected";

export interface APITrainingPendingGroup {
  training: {
    id: string;
    title: string;
    slug: string | null;
    level: string;
    status: string;
    coverColor: string | null;
  };
  modules: Array<{
    id: string;
    title: string;
    description: string | null;
    sortOrder: number;
    isEnabled: boolean;
    status: string;
    createdByAdmin: string | null;
    createdByInstructor: string | null;
    createdAt: string;
    lessons: Array<{
      id: string;
      title: string;
      brief: string | null;
      sortOrder: number;
      durationMinutes: number | null;
      kind: string;
      videoUrl: string | null;
      isMandatory: boolean;
      status: string;
      createdByAdmin: string | null;
      createdByInstructor: string | null;
      createdAt: string;
    }>;
  }>;
}

export interface APIPaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface APIPaginatedPendingContentReviews {
  current_page: number;
  data: APITrainingPendingGroup[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: APIPaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export interface PendingContentReviewsParams {
  query?: string;
  sort_by?: "created_at" | "title" | "updated_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

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