import { createResourceStore } from "./createResourceStore";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";

// Pas de create/update pour cette ressource — seuls list/detail/delete existent.
const store = createResourceStore<APIAdminArticleFeedback>({
  resourceKey: "article-feedback",
  basePath: "docs/article-feedback",
});

export const fetchAdminArticleFeedbacks = store.fetchList;
export const fetchAdminArticleFeedbackById = store.fetchById;
export const deleteAdminArticleFeedback = store.removeItem;

export const useAdminArticleFeedbacksList = store.useList;
export const useAdminArticleFeedbackDetail = store.useDetail;
export const useDeleteAdminArticleFeedback = store.useRemove;