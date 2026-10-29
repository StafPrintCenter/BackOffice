import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import { parseApiError } from "@/lib/api/error";

async function readMessage(response: Response, fallback: string): Promise<string> {
  try {
    const json = await response.json();
    if (typeof json?.message === "string") return json.message;
    if (json?.errors) return Object.values(json.errors).flat().join(" ") || fallback;
  } catch { /* corps non-JSON */ }
  return fallback;
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["trainings"] });
    qc.invalidateQueries({ queryKey: ["admin-students"] }); // adapte si la clé du store apprenants diffère
  };
}

export function useRegenerateCertificate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await adminFetch(`/api/admin/trainings/enrollments/${enrollmentId}/certificates/regenerate`, { method: "POST" });
      if (!response.ok) throw await parseApiError(response, "Impossible de relancer la génération.");
      const message = await readMessage(response, "Impossible de relancer la génération.");
      return message;
    },
    onSuccess: invalidate,
  });
}

export function useRevokeCertificate() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ certificateId, reason }: { certificateId: string; reason: string }) => {
      const fd = new FormData();
      fd.append("reason", reason);
      const response = await adminFetch(`/api/admin/trainings/enrollments/certificates/${certificateId}/revoke`, { method: "PUT", body: fd });
      if (!response.ok) throw await parseApiError(response, "Impossible de révoquer le certificat.");
      const message = await readMessage(response, "Impossible de révoquer le certificat.");
      return message;
    },
    onSuccess: invalidate,
  });
}