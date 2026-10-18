import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-url";
import type {
  APIPaymentDetailResponse, APIPaymentListItem, APIPaymentsSummary,
  CreatePaymentPayload, PaymentsListParams,
} from "@/data/trainingPayments";

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

export function useTrainingPaymentsList(params: PaymentsListParams = {}) {
  const q = useQuery({
    queryKey: ["trainings", "payments", "list", params],
    staleTime: 15_000,
    queryFn: async () => {
      const qp = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qp.append(k, String(v));
      const response = await adminFetch(`/api/admin/trainings/payments/list?${qp.toString()}`);
      await ensureOk(response, "Erreur lors du chargement des paiements.");
      return (await response.json()) as { data: APIPaymentListItem[]; summary: APIPaymentsSummary; meta: Meta };
    },
  });
  return {
    payments: q.data?.data ?? [],
    summary: q.data?.summary ?? null,
    meta: q.data?.meta ?? null,
    isLoading: q.isLoading,
    isError: q.isError,
  };
}

export function useTrainingPaymentDetail(id: string | undefined) {
  const q = useQuery({
    queryKey: ["trainings", "payments", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await adminFetch(`/api/admin/trainings/payments/${id}`);
      if (response.status === 404) return null;
      await ensureOk(response, "Erreur lors du chargement du paiement.");
      return (await response.json()) as APIPaymentDetailResponse;
    },
  });
  return { detail: q.data ?? null, isLoading: q.isLoading, isError: q.isError };
}

/** `enrollmentId` : identifiant de l'inscription (cf. curl de création). */
export function useCreateTrainingPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ enrollmentId, payload }: { enrollmentId: string; payload: CreatePaymentPayload }) => {
      const fd = new FormData();
      fd.append("amount", String(payload.amount));
      fd.append("method", payload.method);
      if (payload.reference) fd.append("reference", payload.reference);
      fd.append("paid_at", payload.paid_at);

      const response = await adminFetch(`/api/admin/trainings/${enrollmentId}/payments/create`, { method: "POST", body: fd });
      await ensureOk(response, "Impossible d'enregistrer le paiement.");
      return response.json().catch(() => null);
    },
    onSuccess: () => {
      // paiements, listes d'apprenants par formation, et détail formation
      qc.invalidateQueries({ queryKey: ["trainings"] });
      // clés du store apprenants : adapte si elles diffèrent
      qc.invalidateQueries({ queryKey: ["admin-students"] });
    },
  });
}