export type TrainingLevel = "Débutant" | "Intermédiaire" | "Avancé";
export type TrainingStatus = "draft" | "published" | "archived";

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
  maxSeats?: number | null;
  seatsRemaining?: number;
  short: string;
  objectives: string[];
  status: TrainingStatus;
  publishedAt?: string | null;
  registrationFee?: number | null;
  accessMinRatio?: number | null;
  registrationDeadline?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  waitingListEnabled?: boolean;
  coverColor?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminTrainingDetail = APIAdminTrainingListItem & {
  audience?: string | null;
  prerequisites?: string[];
  program?: TrainingProgramModule[];
  certification?: string | null;
  schedule?: string | null;
  registrationFee?: number | null;
  accessMinRatio?: number | null;
  waitingListEnabled?: boolean;
  coverColor?: string | null;
};

export interface AdminTrainingPayload {
  title: string;
  theme_id: string;
  duration: string;
  duration_hours: number;
  level: TrainingLevel;
  price: number;
  short: string;
  audience?: string | null;
  objectives: string[];
  prerequisites?: string[];
  program?: TrainingProgramModule[];
  certification?: string | null;
  schedule?: string | null;
  max_seats?: number | null;
  registration_fee?: number | null;
  access_min_ratio?: number | null;
  registration_deadline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location?: string | null;
  waiting_list_enabled?: boolean;
  cover_color?: string | null;
  status?: TrainingStatus;
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