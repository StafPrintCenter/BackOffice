import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";
import type {
  APIReviewRequest, APISession, APISessionDetail, ReviewStatus, SessionsListParams,
} from "@/data/trainingSessions";

type Meta = { currentPage: number; lastPage: number; perPage: number; total: number; pendingTotal?: number };

async function ensureOk(response: Response, fallback: string): Promise<void> {
  if (!response.ok) throw await parseApiError(response, fallback);
}

function toQuery(params: Record<string, unknown>): string {
  const qp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === false) continue;
    qp.append(k, v === true ? "1" : String(v));
  }
  return qp.toString();
}

/** Liste globale, ou limitée à une formation si `trainingId` est fourni. */
export function useSessionsList(params: SessionsListParams = {}, trainingId?: string) {
  const { trainingId: _ignored, ...rest } = params;
  const q = useQuery({
    queryKey: ["trainings", "sessions", "list", trainingId ?? params.trainingId ?? "all", rest],
    staleTime: 15_000,
    queryFn: async () => {
      const base = trainingId
        ? `/api/admin/trainings/${trainingId}/sessions/list`
        : `/api/admin/trainings/sessions/list`;
      const query = trainingId ? toQuery(rest) : toQuery({ ...rest, trainingId: params.trainingId });
      const response = await adminFetch(`${base}?${query}`);
      await ensureOk(response, "Erreur lors du chargement des sessions.");
      return (await response.json()) as { data: APISession[]; meta: Meta };
    },
  });
  return { sessions: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useSessionDetail(id: string | undefined) {
  const q = useQuery({
    queryKey: ["trainings", "sessions", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/trainings/sessions/${id}`);
      if (response.status === 404) return null;
      await ensureOk(response, "Erreur lors du chargement de la session.");
      return ((await response.json()) as { data: APISessionDetail }).data;
    },
  });
  return { session: q.data ?? null, isLoading: q.isLoading, isError: q.isError };
}

function useInvalidateSessions() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["trainings"] });
}

export function useSuspendSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const fd = new FormData();
      fd.append("reason", reason);
      const response = await adminFetch(`/api/admin/trainings/sessions/${id}/suspend`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible de suspendre la session.");
    },
    onSuccess: invalidate,
  });
}

export function useReactivateSession() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminFetch(`/api/admin/trainings/sessions/${id}/reactivate`, { method: "POST" });
      await ensureOk(response, "Impossible de réactiver la session.");
    },
    onSuccess: invalidate,
  });
}

export function useReviewRequests(params: { status?: ReviewStatus | ""; trainingId?: string; page?: number; perPage?: number } = {}) {
  const q = useQuery({
    queryKey: ["trainings", "sessions", "review-requests", params],
    staleTime: 15_000,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/trainings/sessions/review-requests/list?${toQuery(params)}`);
      await ensureOk(response, "Erreur lors du chargement des demandes d'examen.");
      return (await response.json()) as { data: APIReviewRequest[]; meta: Meta };
    },
  });
  return { requests: q.data?.data ?? [], meta: q.data?.meta ?? null, isLoading: q.isLoading, isError: q.isError };
}

export function useReviewSessionRequest() {
  const invalidate = useInvalidateSessions();
  return useMutation({
    mutationFn: async ({ requestId, decision, reason }: { requestId: string; decision: "validated" | "rejected"; reason?: string }) => {
      const fd = new FormData();
      fd.append("decision", decision);
      if (reason) fd.append("reason", reason);
      const response = await adminFetch(`/api/admin/trainings/sessions/review-requests/${requestId}/review`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible de traiter la demande.");
      return ((await response.json()) as { message?: string }).message ?? "Demande traitée.";
    },
    onSuccess: invalidate,
  });
}