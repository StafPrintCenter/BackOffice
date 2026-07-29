export type JobOfferContractType = "cdi" | "cdd" | "stage" | "freelance" | "alternance";
export type JobOfferWorkMode = "presentiel" | "hybride" | "teletravail";
export type JobOfferStatus = "draft" | "published" | "disabled";
export type JobEducationLevel = "sans_diplome" | "bepc" | "bac" | "bac+2" | "bac+3" | "master" | "doctorat";
import type { JobApplicationStatus } from "@/data/jobApplications";

// Liste et détail renvoient les mêmes champs → un seul type.
export type APIAdminJobOffer = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  department: string | null;
  contractType: JobOfferContractType;
  workMode: JobOfferWorkMode;
  location: string | null; // null si workMode = teletravail
  numPositions: number | null;
  description: string;
  missions: string[];
  profile: string[];
  educationLevel: JobEducationLevel | null;
  salaryMin: number | string | null;
  salaryMax: number | string | null;
  expiresAt: string | null;
  status: JobOfferStatus;
  isVisible: boolean;
  publishedAt: string | null;
  applicationsCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

// CREATE : tous les champs acceptés par CreateController. expires_at est obligatoire.
export interface AdminJobOfferCreatePayload {
  title: string;
  summary: string;
  department?: string;
  contract_type: JobOfferContractType;
  work_mode: JobOfferWorkMode;
  location?: string;
  num_positions?: number;
  description: string;
  missions?: string[];
  profile?: string[];
  education_level?: JobEducationLevel;
  salary_min?: number;
  salary_max?: number;
  published_at?: string;
  expires_at: string;
}

// seulement après publication. Ne pas les inclure dans ce payload.
export interface AdminJobOfferUpdatePayload {
  title?: string;
  summary?: string;
  department?: string;
  work_mode?: JobOfferWorkMode;
  location?: string;
  num_positions?: number;
  description?: string;
  missions?: string[];
  education_level?: JobEducationLevel;
  expires_at?: string;
}

export const JOB_OFFER_CONTRACT_LABELS: Record<JobOfferContractType, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
  alternance: "Alternance",
};

export const JOB_OFFER_WORK_MODE_LABELS: Record<JobOfferWorkMode, string> = {
  presentiel: "Présentiel",
  hybride: "Hybride",
  teletravail: "Télétravail",
};

export const JOB_EDUCATION_LEVEL_LABELS: Record<JobEducationLevel, string> = {
  sans_diplome: "Sans diplôme",
  bepc: "BEPC",
  bac: "Bac",
  "bac+2": "Bac+2",
  "bac+3": "Bac+3",
  master: "Master",
  doctorat: "Doctorat",
};

export const JOB_OFFER_STATUS_LABELS: Record<JobOfferStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  disabled: "Désactivée",
};

export const JOB_OFFER_STATUS_BADGES: Record<JobOfferStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  published: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  disabled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function getJobOfferStatusBadge(status: JobOfferStatus): string {
  return JOB_OFFER_STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-transparent";
}

export interface APIAdminJobOfferApplicant {
  id: string;
  firstName: string;
  lastName: string;
  status: JobApplicationStatus;
  submittedAt: string;
}
export interface APIAdminJobOfferDetailWithApplicants {
  offer: APIAdminJobOffer;
  applicants: APIAdminJobOfferApplicant[];
}