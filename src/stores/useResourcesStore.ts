import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import { createResourceStore } from "./createResourceStore";
import type { AdminResourcePayload, APIAdminResource } from "@/data/resources";

const resourceKey = "resources";
const basePath = "resources";
const store = createResourceStore<APIAdminResource, AdminResourcePayload>({
  resourceKey,
  basePath,
});

export const fetchAdminResources = store.fetchList;
export const fetchAdminResourceById = store.fetchById;
export const deleteAdminResource = store.removeItem;
export const useAdminResourcesList = store.useList;
export const useAdminResourceDetail = store.useDetail;
export const useDeleteAdminResource = store.useRemove;

function buildResourceFormData(payload: AdminResourcePayload): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, value.join(","));
    } else if (value === null) {
      formData.append(key, "");
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

async function createResource(payload: AdminResourcePayload): Promise<APIAdminResource> {
  const response = await adminFetch(`/api/admin/${basePath}/create`, {
    method: "POST",
    body: buildResourceFormData(payload),
  });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la création de la ressource");
  const json: { data: APIAdminResource } = await response.json();
  return json.data;
}

async function updateResource(
  id: string,
  payload: AdminResourcePayload,
): Promise<APIAdminResource> {
  const response = await adminFetch(`/api/admin/${basePath}/${id}`, {
    method: "PUT",
    body: buildResourceFormData(payload),
  });
  if (!response.ok) throw await parseApiError(response, "Erreur lors de la modification de la ressource");
  const json: { data: APIAdminResource } = await response.json();
  return json.data;
}

async function setResourceVisibility(id: string, isActive: boolean): Promise<APIAdminResource> {
  const formData = new FormData();
  formData.append("isActive", String(isActive));

  const response = await adminFetch(`/api/admin/${basePath}/${id}/visibility`, {
    method: "PATCH",
    body: formData,
  });
  if (!response.ok) throw await parseApiError(response, "Erreur lors du changement de visibilité");
  const json: { data: APIAdminResource } = await response.json();
  return json.data;
}

export function useCreateAdminResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useUpdateAdminResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminResourcePayload }) =>
      updateResource(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resourceKey] }),
  });
}

export function useSetAdminResourceVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setResourceVisibility(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resourceKey] }),
  });
}
