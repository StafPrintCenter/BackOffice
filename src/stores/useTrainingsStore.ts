import { createResourceStore } from "./createResourceStore";
import type { APIAdminTrainingDetail, AdminTrainingPayload } from "@/data/trainings";

const store = createResourceStore<APIAdminTrainingDetail, AdminTrainingPayload>({
  resourceKey: "trainings",
  basePath: "trainings/catalogs",
});

export const fetchAdminTrainings = store.fetchList;
export const fetchAdminTrainingById = store.fetchById;
export const createAdminTraining = store.createItem;
export const updateAdminTraining = store.updateItem;
export const deleteAdminTraining = store.removeItem;

export const useAdminTrainingsList = store.useList;
export const useAdminTrainingDetail = store.useDetail;
export const useCreateAdminTraining = store.useCreate;
export const useUpdateAdminTraining = store.useUpdate;
export const useDeleteAdminTraining = store.useRemove;