import { GraduationCap } from "lucide-react";
import type { StudentTrainingEnrollment } from "@/data/trainingEnrollments";
import { StudentTrainingCard } from "./StudentTrainingCard";

export function StudentTrainingsSection({ trainings }: { trainings: StudentTrainingEnrollment[] }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-4 w-4 text-primary" /> Formations suivies
        </div>
        <span className="text-xs text-muted-foreground">{trainings.length}</span>
      </div>

      {trainings.length === 0 ? (
        <p className="text-sm text-muted-foreground">Cet apprenant n'est inscrit à aucune formation.</p>
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => (
            <StudentTrainingCard key={t.enrollmentId} enrollment={t} />
          ))}
        </div>
      )}
    </div>
  );
}