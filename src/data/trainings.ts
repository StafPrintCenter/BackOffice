export type TrainingLevel = "Débutant" | "Intermédiaire" | "Avancé";

export type TrainingProgramModule = {
  title: string;
  items: string[];
};

export type APIAdminTrainingListItem = {
  id: string;
  title: string;
  themeId: string;
  theme: string;
  duration: string;
  durationHours: number;
  level: TrainingLevel;
  price: number;
  short: string;
  objectives: string[];
  createdAt: string;
  updatedAt: string;
};

export type APIAdminTrainingDetail = APIAdminTrainingListItem & {
  audience: string;
  prerequisites: string[];
  program: TrainingProgramModule[];
  certification: string;
  schedule: string;
};

export interface AdminTrainingPayload {
  title: string;
  theme_id: string;
  duration: string;
  duration_hours: number;
  level: TrainingLevel;
  price: number;
  short: string;
  audience: string;
  objectives: string[];
  prerequisites: string[];
  program: TrainingProgramModule[];
  certification: string;
  schedule: string;
}

export const TRAINING_LEVEL_BADGES: Record<TrainingLevel, { label: string; className: string }> = {
  Débutant: {
    label: "Débutant",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  Intermédiaire: {
    label: "Intermédiaire",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  Avancé: {
    label: "Avancé",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
};

export function getTrainingLevelBadgeClass(level: TrainingLevel): string {
  return TRAINING_LEVEL_BADGES[level]?.className ?? "bg-muted text-muted-foreground border-border";
}