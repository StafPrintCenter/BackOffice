import { createResourceStore } from "./createResourceStore";
import type { APIAdminServiceDetail, AdminServicePayload } from "@/data/services";

const store = createResourceStore<APIAdminServiceDetail, AdminServicePayload>({
  resourceKey: "services",
  basePath: "services",
});

export const fetchAdminServices = store.fetchList;
export const fetchAdminServiceById = store.fetchById;
export const createAdminService = store.createItem;
export const updateAdminService = store.updateItem;
export const deleteAdminService = store.removeItem;

export const useAdminServicesList = store.useList;
export const useAdminServiceDetail = store.useDetail;
export const useCreateAdminService = store.useCreate;
export const useUpdateAdminService = store.useUpdate;
export const useDeleteAdminService = store.useRemove;