import { createResourceStore } from "./createResourceStore";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/admin-categories";

const store = createResourceStore<APIAdminCategory, AdminCategoryPayload>({
  resourceKey: "categories",
  basePath: "categories",
});

export const fetchAdminCategories = store.fetchList;
export const fetchAdminCategoryById = store.fetchById;
export const createAdminCategory = store.createItem;
export const updateAdminCategory = store.updateItem;
export const deleteAdminCategory = store.removeItem;

export const useAdminCategoriesList = store.useList;
export const useAdminCategoryDetail = store.useDetail;
export const useCreateAdminCategory = store.useCreate;
export const useUpdateAdminCategory = store.useUpdate;
export const useDeleteAdminCategory = store.useRemove;