import { createResourceStore } from "./createResourceStore";
import type { APIAdminStat, AdminStatPayload } from "@/data/stats";

const store = createResourceStore<APIAdminStat, AdminStatPayload>({
  resourceKey: "stats",
  basePath: "stats",
});

export const fetchAdminStats = store.fetchList;
export const fetchAdminStatById = store.fetchById;
export const createAdminStat = store.createItem;
export const updateAdminStat = store.updateItem;
export const deleteAdminStat = store.removeItem;

export const useAdminStatsList = store.useList;
export const useAdminStatDetail = store.useDetail;
export const useCreateAdminStat = store.useCreate;
export const useUpdateAdminStat = store.useUpdate;
export const useDeleteAdminStat = store.useRemove;