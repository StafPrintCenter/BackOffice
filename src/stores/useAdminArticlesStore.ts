import { createResourceStore } from "./createResourceStore";
import type { APIAdminArticleDetail, AdminArticlePayload } from "@/data/articles";

const store = createResourceStore<APIAdminArticleDetail, AdminArticlePayload>({
  resourceKey: "articles",
  basePath: "articles",
});

export const fetchAdminArticles = store.fetchList;
export const fetchAdminArticleById = store.fetchById;
export const createAdminArticle = store.createItem;
export const updateAdminArticle = store.updateItem;
export const deleteAdminArticle = store.removeItem;

export const useAdminArticlesList = store.useList;
export const useAdminArticleDetail = store.useDetail;
export const useCreateAdminArticle = store.useCreate;
export const useUpdateAdminArticle = store.useUpdate;
export const useDeleteAdminArticle = store.useRemove;