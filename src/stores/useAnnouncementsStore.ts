import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { AdminAnnouncementAnalytics } from "@/data/announcements";
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

async function fetchAnalytics(id: string): Promise<AdminAnnouncementAnalytics> {
  const response = await adminFetch(`/api/admin/announcements/${id}/analytics`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des analyses");
  return response.json();
}

export const fetchAdminAnnouncementAnalytics = fetchAnalytics;

export function useAdminAnnouncementAnalytics(id: string | undefined) {
  const query = useQuery({
    queryKey: ["announcements", "analytics", id],
    queryFn: () => fetchAnalytics(id as string),
    enabled: !!id,
  });
  return { analytics: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}