export type ReportStatus = "pending" | "in_review" | "resolved" | "dismissed";

// Liste et détail renvoient les mêmes champs → un seul type, comme pour "contact"/"appointments".
export type APIAdminReport = {
  id: string;
  reportableType: string;
  reportableId: string;
  reason: string;
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