import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIReport, CategoryPayload, CommunityStats, ReportsListParams, ReportsStats, ResolveAction,
} from "@/data/communityAdmin";

type Meta = { currentPage: number; lastPage: number; perPage: number; total: number };

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

function toQuery(params: Record<string, unknown>): string {
  const qp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === false) continue;
    qp.append(k, String(v));
  }
  return qp.toString();
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["community"] });
}

// ----------------------------------------------------------- signalements

export function useReportsList(params: ReportsListParams = {}) {
  const q = useQuery({
    queryKey: ["community", "admin", "reports", params],
    staleTime: 15_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/community/reports/list?${toQuery(params)}`);
      await ensureOk(response, "Erreur lors du chargement des signalements.");
      return (await response.json()) as { stats: ReportsStats; data: APIReport[]; meta: Meta };
    },
  });
  return { reports: q.data?.data ?? [], stats: q.data?.stats ?? null, meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useReportDetail(id: string | undefined) {
  const q = useQuery({
    queryKey: ["community", "admin", "report", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/community/reports/${id}`);
      if (response.status === 404) return null;
      await ensureOk(response, "Erreur lors du chargement du signalement.");
      return (await response.json()) as APIReport;
    },
  });
  return { report: q.data ?? null, isLoading: q.isLoading };
}

export function useResolveReport() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, action, note }: { id: string; action: ResolveAction; note?: string }) => {
      const fd = new FormData();
      fd.append("action", action);
      if (note) fd.append("note", note);
      const response = await adminFetch(`/api/admin/community/reports/${id}/resolve`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible de traiter le signalement.");
      return (await response.json()) as APIReport;
    },
    onSuccess: invalidate,
  });
}

export function useCommunityStats(days: number) {
  const q = useQuery({
    queryKey: ["community", "admin", "stats", days],
    staleTime: 60_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/community/stats?days=${days}`);
      await ensureOk(response, "Erreur lors du chargement des statistiques.");
      return (await response.json()) as CommunityStats;
    },
  });
  return { stats: q.data ?? null, isLoading: q.isLoading, isError: q.isError };
}

// -------------------------------------------------------------- catégories

function categoryForm(p: Partial<CategoryPayload>): FormData {
  const fd = new FormData();
  if (p.name !== undefined) fd.append("name", p.name);
  if (p.description !== undefined) fd.append("description", p.description);
  if (p.color) fd.append("color", p.color);
  if (p.sortOrder !== undefined && !Number.isNaN(p.sortOrder)) fd.append("sortOrder", String(p.sortOrder));
  if (p.isActive !== undefined) fd.append("isActive", p.isActive ? "true" : "false");
  return fd;
}

export function useCreateCommunityCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (payload: CategoryPayload) => {
      const response = await adminFetch(`/api/admin/community/categories/create`, { method: "POST", body: categoryForm(payload) });
      await ensureOk(response, "Impossible de créer la catégorie.");
    },
    onSuccess: invalidate,
  });
}

export function useUpdateCommunityCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) => {
      const response = await adminFetch(`/api/admin/community/categories/${id}`, { method: "PUT", body: categoryForm(payload) });
      await ensureOk(response, "Impossible de modifier la catégorie.");
    },
    onSuccess: invalidate,
  });
}

export function useDeleteCommunityCategory() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`/api/admin/community/categories/${id}`, { method: "DELETE" });
      await ensureOk(response, "Impossible de supprimer la catégorie.");
    },
    onSuccess: invalidate,
  });
}