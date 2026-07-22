import { createResourceStore } from "./createResourceStore";
import type { APIAdminTestimonial, AdminTestimonialPayload } from "@/data/testimonials";

const store = createResourceStore<APIAdminTestimonial, AdminTestimonialPayload>({
  resourceKey: "testimonials",
  basePath: "testimonials",
});

export const fetchAdminTestimonials = store.fetchList;
export const fetchAdminTestimonialById = store.fetchById;
export const createAdminTestimonial = store.createItem;
export const updateAdminTestimonial = store.updateItem;
export const deleteAdminTestimonial = store.removeItem;

export const useAdminTestimonialsList = store.useList;
export const useAdminTestimonialDetail = store.useDetail;
export const useCreateAdminTestimonial = store.useCreate;
export const useUpdateAdminTestimonial = store.useUpdate;
export const useDeleteAdminTestimonial = store.useRemove;