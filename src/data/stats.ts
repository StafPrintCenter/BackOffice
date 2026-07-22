export type StatKeyType = "projects" | "clients" | "experience" | "trainings";

export const STAT_KEYS: { value: StatKeyType; label: string }[] = [
  { value: "projects", label: "Projets réalisés (projects)" },
  { value: "clients", label: "Clients satisfaits (clients)" },
  { value: "experience", label: "Années d'expérience (experience)" },
  { value: "trainings", label: "Formations dispensées (trainings)" },
];

export interface APIAdminStat {
  id: string;
  key: StatKeyType;
  value: number;
  suffix: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStatPayload {
  key: StatKeyType;
  value: number;
  suffix: string;
  label: string;
}