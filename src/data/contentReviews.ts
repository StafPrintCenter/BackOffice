import type { APIAdminTrainingModule, APIAdminLesson } from "@/data/trainingModules";

export type ContentReviewableType = "module" | "lesson";
export type ContentReviewDecision = "approved" | "rejected";

export interface APIPendingContentReviews {
  modules: APIAdminTrainingModule[];
  lessons: APIAdminLesson[];
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