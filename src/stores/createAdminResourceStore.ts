import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin-api-fetch";

export type AdminListParams = Record<string, string | number | undefined>;

interface ListResponse<T> {
  data: T[];
  links: any;
  meta: any;
}

interface DetailResponse<T> {
  data: T;
}

interface CreateAdminResourceStoreOptions {
  resourceKey: string;
  /** Segment de route admin (ex: "articles", "categories") */
  basePath: string;
}

/** Convertit un payload (déjà en snake_case) en FormData, en omettant les valeurs undefined */
function buildFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
    } else {
      fd.append(key, value === null ? "" : String(value));
    }
  }
  return fd;
}

export function createAdminResourceStore<T extends { id: string }, TPayload = Record<string, unknown>>({
  resourceKey,
  basePath,
}: CreateAdminResourceStoreOptions) {
  async function fetchList(params: AdminListParams = {}): Promise<ListResponse<T>> {
    const qp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qp.append(key, String(value));
    }

    const response = await adminFetch(`/api/admin/${basePath}/list?${qp.toString()}`);
    if (!response.ok) throw new Error(`Erreur lors de la récupération de "${resourceKey}"`);
    return response.json();
  }

  async function fetchById(id: string): Promise<T | null> {
    const response = await adminFetch(`/api/admin/${basePath}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Erreur lors de la récupération de l'élément "${resourceKey}"`);
    const json: DetailResponse<T> = await response.json();
    return json.data;
  }

  async function createItem(payload: TPayload): Promise<T> {
    const response = await adminFetch(`/api/admin/${basePath}/create`, {
      method: "POST",
      body: buildFormData(payload as Record<string, unknown>),
    });
    if (!response.ok) throw new Error(`Erreur lors de la création de "${resourceKey}"`);
    const json: DetailResponse<T> = await response.json();
    return json.data;
  }

  async function updateItem(id: string, payload: TPayload): Promise<T> {
    const response = await adminFetch(`/api/admin/${basePath}/${id}`, {
      method: "PUT",
      body: buildFormData(payload as Record<string, unknown>),
    });
    if (!response.ok) throw new Error(`Erreur lors de la modification de "${resourceKey}"`);
    const json: DetailResponse<T> = await response.json();
    return json.data;
  }

  async function removeItem(id: string): Promise<void> {
    const response = await adminFetch(`/api/admin/${basePath}/${id}`, { method: "DELETE" });
    if (!response.ok && response.status !== 204) throw new Error(`Erreur lors de la suppression de "${resourceKey}"`);
  }

  function useList(params: AdminListParams = {}) {
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

  function useDetail(id: string | undefined) {
    const query = useQuery({
      queryKey: [resourceKey, "admin-detail", id],
      queryFn: () => fetchById(id as string),
      enabled: !!id,
    });
    return { item: query.data ?? null, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (payload: TPayload) => createItem(payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: TPayload }) => updateItem(id, payload),
      onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => removeItem(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: [resourceKey] }),
    });
  }

  return { fetchList, fetchById, createItem, updateItem, removeItem, useList, useDetail, useCreate, useUpdate, useRemove };
}