export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  color: string;
  featured: boolean;
  features?: string[];
  process?: string[];
  createdAt: string;
}

export interface FormationModule {
  title: string;
  lessons: string[];
}

export interface Formation {
  id: string;
  title: string;
  theme: string;
  duration: string;
  durationHours?: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  price: number;
  short?: string;
  audience?: string;
  objectives: string[];
  prerequisites?: string[];
  program: FormationModule[];
  certification?: string;
  schedule?: string;
  image?: string;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  token: string;
}

export type ReportStatus = "ouvert" | "en_cours" | "resolu" | "rejete";

export interface Report {
  id: string;
  reportableType: string;
  reportableId: string;
  reason: string;
  message: string;
  reporterEmail: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}
