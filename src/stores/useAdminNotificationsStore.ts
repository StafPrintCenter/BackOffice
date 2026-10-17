import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type {
  APINotificationDetail, APINotificationListItem, APINotificationPreference,
  APINotificationsMeta, DeliveryMode, NotificationCategory,
} from "@/data/notifications";

async function ensureOk(response: Response, fallback: string): Promise<void> {
  if (response.ok) return;
  let message = fallback;
  try {
    const json = await response.json();
    if (typeof json?.message === "string") message = json.message;
    else if (json?.errors) message = Object.values(json.errors).flat().join(" ") || fallback;
  } catch { /* corps non-JSON */ }
  throw new Error(message);
}

export interface NotificationsListParams { page?: number; perPage?: number }

async function fetchList(params: NotificationsListParams) {
  const qp = new URLSearchParams();
  if (params.page) qp.append("page", String(params.page));
  if (params.perPage) qp.append("perPage", String(params.perPage));
  const response = await adminFetch(`/api/notifications/manage/list?${qp.toString()}`);
  await ensureOk(response, "Erreur lors du chargement des notifications.");
  return (await response.json()) as { data: APINotificationListItem[]; meta: APINotificationsMeta };
}

export function useNotificationsList(params: NotificationsListParams = {}, enabled = true) {
  const q = useQuery({
    queryKey: ["notifications", "list", params],
    queryFn: () => fetchList(params),
    enabled,
    staleTime: 15_000,
  });
  return { items: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

/** Badge : rafraîchi toutes les 60 s */
export function useUnreadCount() {
  const q = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await adminFetch(`/api/notifications/manage/unread-count`);
      await ensureOk(response, "Erreur lors du chargement du compteur.");
      const json = (await response.json()) as { data: { unreadCount: number } };
      return json.data.unreadCount;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  return { count: q.data ?? 0 };
}

/** Ouvrir le détail marque la notification comme lue côté backend : on rafraîchit liste + badge. */
export function useNotificationDetail(id: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notifications", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await adminFetch(`/api/notifications/manage/${id}`);
      if (response.status === 404) return null;
      await ensureOk(response, "Erreur lors du chargement de la notification.");
      const json = (await response.json()) as { data: APINotificationDetail };
      qc.invalidateQueries({ queryKey: ["notifications", "list"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      return json.data;
    },
  });
  return { notification: q.data ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`/api/notifications/manage/${id}/read`, { method: "PATCH" });
      await ensureOk(response, "Impossible de marquer la notification comme lue.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await adminFetch(`/api/notifications/manage/read-all`, { method: "PATCH" });
      await ensureOk(response, "Impossible de tout marquer comme lu.");
      return ((await response.json()) as { message?: string }).message ?? "Notifications marquées comme lues.";
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useNotificationPreferences() {
  const q = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const response = await adminFetch(`/api/notifications/preferences`);
      await ensureOk(response, "Erreur lors du chargement des préférences.");
      return ((await response.json()) as { data: APINotificationPreference[] }).data;
    },
  });
  return { preferences: q.data ?? [], isLoading: q.isLoading, isError: q.isError };
}

export interface UpdatePreferenceParams {
  category: NotificationCategory;
  enabled: boolean;
  deliveryMode: DeliveryMode;
  scheduleDays?: number[];
  scheduleStartTime?: string; // HH:mm
  scheduleEndTime?: string;   // HH:mm
}

export function useUpdatePreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, ...body }: UpdatePreferenceParams) => {
      const response = await adminFetch(`/api/notifications/preferences/${category}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await ensureOk(response, "Impossible d'enregistrer la préférence.");
      return ((await response.json()) as { data: APINotificationPreference }).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
}