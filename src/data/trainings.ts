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
  program: TrainingProgramModule[]; // ⚠️ format à confirmer avec le back-end (voir ta remarque)
  certification: string;
  schedule: string;
}