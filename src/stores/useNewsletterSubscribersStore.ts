import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type { AdminListParams } from "./createResourceStore";
import type { APIAdminNewsletterSubscriberListItem, APIAdminNewsletterSubscriberDetail, AdminNewsletterBlockPayload, } from "@/data/newsletter";

const resourceKey = "newsletter-subscribers";
const basePath = "newsletter/subscribers";

interface ListResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

interface DetailResponse<T> {
  data: T;
}

function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    fd.append(key, value === null ? "" : String(value));
  }
  return fd;
}

async function fetchList(params: AdminListParams = {}): Promise<ListResponse<APIAdminNewsletterSubscriberListItem>> {
  const qp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qp.append(key, String(value));
  }
  const response = await adminFetch(`/api/admin/${basePath}/list?${qp.toString()}`);
  if (!response.ok) throw new Error(`Erreur lors de la récupération de "${resourceKey}"`);
  return response.json();
}

async function fetchById(id: string): Promise<APIAdminNewsletterSubscriberDetail | null> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Erreur lors de la récupération de l'élément "${resourceKey}"`);
  const json: DetailResponse<APIAdminNewsletterSubscriberDetail> = await response.json();
  return json.data;
}

async function removeItem(id: string): Promise<void> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) throw new Error(`Erreur lors de la suppression de "${resourceKey}"`);
}

async function blockSubscriber(id: string, payload: AdminNewsletterBlockPayload): Promise<APIAdminNewsletterSubscriberDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/block`, {
    method: "PUT",
    body: buildFormData(payload as unknown as Record<string, unknown>),
  });
  if (!response.ok) throw new Error(`Erreur lors du blocage de l'abonné`);
  const json: DetailResponse<APIAdminNewsletterSubscriberDetail> = await response.json();
  return json.data;
}

async function reactivateSubscriber(id: string): Promise<APIAdminNewsletterSubscriberDetail> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}/reactivate`, { method: "PUT" });
  if (!response.ok) throw new Error(`Erreur lors de la réactivation de l'abonné`);
  const json: DetailResponse<APIAdminNewsletterSubscriberDetail> = await response.json();
  return json.data;
}

export const fetchAdminNewsletterSubscribers = fetchList;
export const fetchAdminNewsletterSubscriberById = fetchById;
export const deleteAdminNewsletterSubscriber = removeItem;
export const blockAdminNewsletterSubscriber = blockSubscriber;
export const reactivateAdminNewsletterSubscriber = reactivateSubscriber;

export function useAdminNewsletterSubscribersList(params: AdminListParams = {}) {
  const query = useQuery({
    queryKey: [resourceKey, "admin-list", params],
    queryFn: () => fetchList(params),
    staleTime: 1000 * 30,
  });
  return {
    items: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useAdminNewsletterSubscriberDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: [resourceKey, "admin-detail", id],
    queryFn: () => fetchById(id as string),
    enabled: !!id,
  });
  return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
}

export function useDeleteAdminNewsletterSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useBlockAdminNewsletterSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminNewsletterBlockPayload }) => blockSubscriber(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useReactivateAdminNewsletterSubscriber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateSubscriber(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
  });
}
