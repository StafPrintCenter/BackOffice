import { useState } from "react";
import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrainingStudentsList } from "@/stores/useTrainingStudentsStore";
import { TrainingStudentRow } from "./TrainingStudentRow";

export function TrainingStudentsSection({ trainingId, color }: { trainingId: string; color?: string }) {
  const [page, setPage] = useState(1);
  const { students, meta, isLoading, isError } = useTrainingStudentsList(trainingId, { page, perPage: 12 });

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-4 w-4" style={{ color }} /> Apprenants inscrits
        </div>
        {meta && <span className="text-xs text-muted-foreground">{meta.total} au total</span>}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les apprenants.</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun apprenant inscrit pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <TrainingStudentRow key={s.enrollmentId} student={s} color={color} />
          ))}
        </div>
      )}

      {meta && meta.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-muted-foreground">Page {meta.currentPage} / {meta.lastPage}</span>
          <Button variant="outline" size="sm" disabled={page >= meta.lastPage} onClick={() => setPage((p) => p + 1)}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}