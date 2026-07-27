export type JobOfferContractType = "cdi" | "cdd" | "stage" | "freelance" | "alternance";
export type JobOfferStatus = "draft" | "published" | "disabled";

// Liste et détail renvoient les mêmes champs → un seul type.
export type APIAdminJobOffer = {
  id: string;
  title: string;
  slug: string;
  department: string;
  contractType: JobOfferContractType;
  location: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salaryMin: number | string | null;
  salaryMax: number | string | null;
  expiresAt: string | null;
  status: JobOfferStatus;
  isVisible: boolean;
  publishedAt: string | null;
  applicationsCount: number;
  createdBy?: string;
  createdAt: string;
};

export interface AdminJobOfferPayload {
  title?: string;
  department?: string | null;
  contract_type?: JobOfferContractType;
  location?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  published_at?: string;
  expires_at?: string;
}

export const JOB_OFFER_CONTRACT_LABELS: Record<JobOfferContractType, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
  alternance: "Alternance",
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