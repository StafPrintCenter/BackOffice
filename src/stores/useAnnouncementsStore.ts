import { createResourceStore } from "./createResourceStore";
import type { APIAdminAnnouncement, AdminAnnouncementPayload } from "@/data/announcements";

const store = createResourceStore<APIAdminAnnouncement, AdminAnnouncementPayload>({
  resourceKey: "announcements",
  basePath: "announcements",
});

export const fetchAdminAnnouncements = store.fetchList;
export const fetchAdminAnnouncementById = store.fetchById;
export const createAdminAnnouncement = store.createItem;
export const updateAdminAnnouncement = store.updateItem;
export const deleteAdminAnnouncement = store.removeItem;

export const useAdminAnnouncementsList = store.useList;
export const useAdminAnnouncementDetail = store.useDetail;
export const useCreateAdminAnnouncement = store.useCreate;
export const useUpdateAdminAnnouncement = store.useUpdate;
export const useDeleteAdminAnnouncement = store.useRemove;