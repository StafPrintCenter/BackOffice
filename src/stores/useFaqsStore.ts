import { createResourceStore } from "./createResourceStore";
import type { APIAdminFaq, AdminFaqPayload } from "@/data/faqs";

const store = createResourceStore<APIAdminFaq, AdminFaqPayload>({
  resourceKey: "faqs",
  basePath: "faqs",
});

export const fetchAdminFaqs = store.fetchList;
export const fetchAdminFaqById = store.fetchById;
export const createAdminFaq = store.createItem;
export const updateAdminFaq = store.updateItem;
export const deleteAdminFaq = store.removeItem;

export const useAdminFaqsList = store.useList;
export const useAdminFaqDetail = store.useDetail;
export const useCreateAdminFaq = store.useCreate;
export const useUpdateAdminFaq = store.useUpdate;
export const useDeleteAdminFaq = store.useRemove;