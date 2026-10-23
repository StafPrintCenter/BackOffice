import { Link } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { useSessionsList } from "@/stores/useTrainingSessionsStore";
import { SessionCard } from "./SessionCard";

export function TrainingSessionsCard({ trainingId, color }: { trainingId: string; color?: string }) {
  const { sessions, meta, isLoading, isError } = useSessionsList({ perPage: 5 }, trainingId);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold"><CalendarRange className="h-4 w-4" style={{ color }} /> Sessions</div>
        {meta && meta.total > 0 && (
          <Link to="/trainings/sessions" search={{ trainingId }} className="text-xs text-primary hover:underline">
            Tout voir ({meta.total})
          </Link>
        )}
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Chargement...</p>
        : isError ? <p className="text-sm text-destructive">Impossible de charger les sessions.</p>
          : sessions.length === 0 ? <p className="text-sm text-muted-foreground">Aucune session planifiée.</p>
            : <div className="space-y-3">{sessions.map((s) => <SessionCard key={s.id} session={s} hideTraining />)}</div>}
    </div>
  );
}