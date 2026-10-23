export type SessionStatus = "published" | "suspended";
export type SessionModality = "in_person" | "online";
export type ReviewStatus = "pending" | "validated" | "rejected";

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = { published: "Publiée", suspended: "Suspendue" };
export const MODALITY_LABELS: Record<SessionModality, string> = { in_person: "Présentiel", online: "En ligne" };
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "En attente", validated: "Validée", rejected: "Rejetée",
};

export type APISession = {
  id: string;
  trainingId: string;
  trainingTitle: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  modality: SessionModality;
  location: string | null;
  meetingUrl: string | null;
  status: SessionStatus;
  isUpcoming: boolean;
  instructorId: string;
  instructorName: string;
  createdAt: string;
  confirmedCount: number;
  declinedCount: number;
  suspendedAt: string | null;
  suspensionReason: string | null;
  /** Forme non documentée : seule la présence est utilisée */
  pendingReviewRequest: { id?: string; message?: string } | null;
};

export type APISessionResponse = {
  studentId: string;
  studentName: string;
  response: "confirmed" | "declined" | string;
  respondedAt: string | null;
};

export type APISessionReviewSummary = {
  id: string;
  status: ReviewStatus;
  message: string;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

export type APISessionDetail = APISession & {
  invitedCount: number | null;
  suspendedBy: string | null;
  responses: APISessionResponse[];
  reviewRequests: APISessionReviewSummary[];
};

export type APIReviewRequest = {
  id: string;
  status: ReviewStatus;
  message: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  instructorId: string;
  instructorName: string;
  session: {
    id: string;
    title: string;
    startsAt: string;
    status: SessionStatus;
    suspensionReason: string | null;
    trainingId: string;
    trainingTitle: string;
  };
};

export type SessionsListParams = {
  page?: number;
  perPage?: number;
  status?: SessionStatus | "";
  modality?: SessionModality | "";
  upcoming?: boolean;
  awaitingReview?: boolean;
  from?: string;
  to?: string;
  query?: string;
  trainingId?: string;
};

export const formatSessionDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";

export const formatSessionRange = (startsAt: string, endsAt: string) => {
  const end = new Date(endsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${formatSessionDate(startsAt)} – ${end}`;
};

export const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m}` : `${h} h`;
};