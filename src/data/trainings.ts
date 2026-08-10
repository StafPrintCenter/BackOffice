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
  max_seats?: number | null;
  registration_fee?: number | null;
  access_min_ratio?: number | null;
  registration_deadline?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  waiting_list_enabled?: boolean;
  cover_color?: string;
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

export const TRAINING_STATUS_BADGES: Record<TrainingStatus, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  published: {
    label: "Publiée",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  archived: {
    label: "Archivée",
    className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  },
};

export function getTrainingStatusBadgeClass(status: TrainingStatus): string {
  return TRAINING_STATUS_BADGES[status]?.className ?? "bg-muted text-muted-foreground border-border";
}

export function getTrainingStatusLabel(status: TrainingStatus): string {
  return TRAINING_STATUS_BADGES[status]?.label ?? status;
}

/**
 * Nettoie un AdminTrainingPayload avant envoi : convertit les chaînes vides
 * (dates, location, cover_color) et les 0 "non renseignés" (registration_fee,
 * access_min_ratio) en `undefined` pour que buildFormData les omette, plutôt
 * que d'envoyer une valeur vide sur un champ `nullable|date` côté Laravel.
 */
export function sanitizeTrainingPayload(payload: AdminTrainingPayload): AdminTrainingPayload {
  return {
    ...payload,
    registration_deadline: payload.registration_deadline || undefined,
    start_date: payload.start_date || undefined,
    end_date: payload.end_date || undefined,
    location: payload.location || undefined,
    cover_color: payload.cover_color || undefined,
    registration_fee: payload.registration_fee || undefined,
    access_min_ratio: payload.access_min_ratio || undefined,
  };
}