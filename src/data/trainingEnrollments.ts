export type APITrainingStudent = {
  enrollmentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  photo: string | null;
  isBlocked: boolean;
  status: string;
  progress: number;
  paymentStatus: string;
  amountPaid: number;
  hasContentAccess: boolean;
  certificateStatus: string;
  enrolledAt: string;
  completedAt: string | null;
};

/** Élément de `trainings` dans le détail d'un apprenant. */
export type StudentTrainingEnrollment = {
  enrollmentId: string;
  trainingId: string;
  trainingTitle: string;
  trainingStatus: string;
  status: string;
  progress: number;
  paymentStatus: string;
  amountPaid: number;
  certificateStatus: string;
  certificateId: string | null;
  enrolledAt: string;
  completedAt: string | null;
};

type BadgeMeta = { label: string; className: string };

const NEUTRAL = "bg-muted text-muted-foreground border-border";
const BLUE = "bg-blue-500/10 text-blue-600 border-blue-500/20";
const GREEN = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
const AMBER = "bg-amber-500/10 text-amber-600 border-amber-500/20";
const RED = "bg-rose-500/10 text-rose-600 border-rose-500/20";

const ENROLLMENT_STATUS: Record<string, BadgeMeta> = {
  pending: { label: "En attente", className: AMBER },
  confirmed: { label: "Confirmée", className: BLUE },
  in_progress: { label: "En cours", className: BLUE },
  completed: { label: "Terminée", className: GREEN },
  cancelled: { label: "Annulée", className: RED },
  waitlisted: { label: "Liste d'attente", className: AMBER },
};

const PAYMENT_STATUS: Record<string, BadgeMeta> = {
  unpaid: { label: "Impayé", className: RED },
  partial: { label: "Partiel", className: AMBER },
  paid: { label: "Payé", className: GREEN },
  refunded: { label: "Remboursé", className: NEUTRAL },
};

const CERTIFICATE_STATUS: Record<string, BadgeMeta> = {
  not_eligible: { label: "Non éligible", className: NEUTRAL },
  eligible: { label: "Disponible", className: BLUE },
  issued: { label: "Délivré", className: BLUE },
  downloaded: { label: "Téléchargé", className: GREEN },
  revoked: { label: "Révoqué", className: RED },
};

const pick = (map: Record<string, BadgeMeta>, key: string): BadgeMeta =>
  map[key] ?? { label: key, className: NEUTRAL };

export const getEnrollmentStatusMeta = (s: string) => pick(ENROLLMENT_STATUS, s);
export const getPaymentStatusMeta = (s: string) => pick(PAYMENT_STATUS, s);
export const getCertificateStatusMeta = (s: string) => pick(CERTIFICATE_STATUS, s);

export const formatFcfa = (n: number) => `${n.toLocaleString("fr-FR")} FCFA`;

export const formatEnrollmentDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "-";