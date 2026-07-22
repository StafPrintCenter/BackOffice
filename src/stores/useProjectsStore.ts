import { createResourceStore } from "./createResourceStore";
import type { APIAdminProject, AdminProjectPayload } from "@/data/projects";

const store = createResourceStore<APIAdminProject, AdminProjectPayload>({
  resourceKey: "projects",
  basePath: "projects",
});

export const fetchAdminProjects = store.fetchList;
export const fetchAdminProjectById = store.fetchById;
export const createAdminProject = store.createItem;
export const updateAdminProject = store.updateItem;
export const deleteAdminProject = store.removeItem;

export const useAdminProjectsList = store.useList;
export const useAdminProjectDetail = store.useDetail;
export const useCreateAdminProject = store.useCreate;
export const useUpdateAdminProject = store.useUpdate;
export const useDeleteAdminProject = store.useRemove;