import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api/resolve-url";
import type { APITrainingStudent } from "@/data/trainingEnrollments";

type Meta = { currentPage: number; lastPage: number; perPage: number; total: number };

export function useTrainingStudentsList(trainingId: string, params: { page?: number; perPage?: number } = {}) {
  const query = useQuery({
    queryKey: ["trainings", "students", trainingId, params],
    enabled: !!trainingId,
    staleTime: 30_000,
    queryFn: async () => {
      const qp = new URLSearchParams();
      if (params.page) qp.append("page", String(params.page));
      if (params.perPage) qp.append("perPage", String(params.perPage));
      const response = await adminFetch(`/api/admin/trainings/${trainingId}/students/list?${qp.toString()}`);
      if (!response.ok) throw new Error("Erreur lors du chargement des apprenants inscrits.");
      return (await response.json()) as { data: APITrainingStudent[]; meta: Meta };
    },
  });

  return {
    students: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}