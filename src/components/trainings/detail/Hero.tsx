import { Clock, MapPin, Signal } from "lucide-react";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import type { TrainingDetailItem } from "./training-form";

interface Props { training: TrainingDetailItem; themeColorClass: string; mainColor: string }

export function TrainingDetailHero({ training, themeColorClass, mainColor }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border p-6 lg:p-8" style={{ background: `linear-gradient(135deg, ${mainColor}15 0%, ${mainColor}03 100%)` }}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: mainColor }} />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex rounded-full px-2 py-1 font-medium ${themeColorClass}`}>{training.theme}</span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrainingLevelBadgeClass(training.level)}`}><Signal className="h-3 w-3" /> {training.level}</span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${getTrainingStatusBadgeClass(training.status)}`}>{getTrainingStatusLabel(training.status)}</span>
          {training.coverColor && (
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full border" style={{ backgroundColor: training.coverColor }} />
              <span className="font-mono text-[11px] uppercase text-muted-foreground">{training.coverColor}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-muted-foreground backdrop-blur"><Clock className="h-3 w-3" /> {training.duration}</span>
          {training.location && <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-muted-foreground backdrop-blur"><MapPin className="h-3 w-3" /> {training.location}</span>}
        </div>
        <div className="flex items-stretch gap-3.5">
          <div className="my-1 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: mainColor }} />
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{training.title}</h1>
        </div>
        <p className="max-w-3xl text-muted-foreground">{training.short}</p>
      </div>
    </div>
  );
}