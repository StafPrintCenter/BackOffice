export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";

export type ReportReason =
  | "broken_link"
  | "incorrect_info"
  | "inappropriate_content"
  | "spam"
  | "other";

export type ReportableType =
  | "short_link"
  | "service"
  | "training"
  | "article"
  | "project";

export type APIAdminReport = {
  id: string;
  reportableType: ReportableType | string;
  reportableId: string;
  reason: ReportReason | string;
  message: string | null;
  reporterEmail: string | null;
  status: ReportStatus;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface AdminReportStatusPayload {
  status: ReportStatus;
}

/* --- MAPPINGS & CONSTANTES D'AFFICHAGE --- */
export const REPORT_STATUS_BADGES: Record<ReportStatus, string> = {
  pending: "bg-red-100 text-red-700 border-red-200",
  in_review: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dismissed: "bg-muted text-muted-foreground border-border",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Ouvert",
  in_review: "En cours",
  resolved: "Résolu",
  dismissed: "Rejeté",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  broken_link: "Lien cassé",
  incorrect_info: "Information incorrecte",
  inappropriate_content: "Contenu inapproprié",
  spam: "Spam / Abus",
  other: "Autre motif",
};

export const REPORTABLE_TYPE_LABELS: Record<ReportableType, string> = {
  short_link: "Lien court",
  service: "Service",
  training: "Formation",
  article: "Article",
  project: "Projet",
};

/** Helper pour récupérer le libellé d'un motif */
export const getReportReasonLabel = (reason: string): string => {
  return REPORT_REASON_LABELS[reason as ReportReason] ?? reason;
};

/** Helper pour récupérer le libellé d'un type de cible */
export const getReportableTypeLabel = (type: string): string => {
  return REPORTABLE_TYPE_LABELS[type as ReportableType] ?? type;
};