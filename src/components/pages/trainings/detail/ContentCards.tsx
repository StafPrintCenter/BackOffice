import { BookOpen, Target } from "lucide-react";
import type { TrainingProgramModule } from "@/data/trainings";
import type { TrainingDetailItem } from "./form";

export function TrainingDetailObjectivesCard({ training, mainColor }: { training: TrainingDetailItem; mainColor: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-3 flex items-center gap-2 font-semibold"><Target className="h-4 w-4" style={{ color: mainColor }} /> Objectifs</div>
      <ul className="space-y-1.5 text-sm">
        {training.objectives.map((o: string, i: number) => (
          <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: mainColor }} /> {o}</li>
        ))}
      </ul>
    </div>
  );
}

export function TrainingDetailProgramCard({ training, mainColor }: { training: TrainingDetailItem; mainColor: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" style={{ color: mainColor }} /> Programme</div>
      <div className="space-y-5">
        {training.program.map((m: TrainingProgramModule, i: number) => (
          <div key={i} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ backgroundColor: `${mainColor}20`, color: mainColor }}>{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{m.title}</div>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">{m.items.map((it: string, j: number) => <li key={j}>{it}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}