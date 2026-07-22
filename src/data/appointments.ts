export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type AppointmentMode = "presentiel" | "en_ligne";

export type APIAdminAppointment = {
  id: string;
  mode: AppointmentMode;
  duration: number;
  scheduledAt: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string | null;
  subject: string;
  message: string | null;
  status: AppointmentStatus;
  adminNotes: string | null;
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface AdminAppointmentStatusPayload {
  status: AppointmentStatus;
  admin_notes?: string;
}

/* --- CONSTANTES D'AFFICHAGE ET STYLES --- */

export const APPOINTMENT_STATUS_BADGES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-blue-100 text-blue-700",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  cancelled: "Annulé",
  completed: "Terminé",
};

export const APPOINTMENT_MODE_LABELS: Record<AppointmentMode, string> = {
  presentiel: "Présentiel",
  en_ligne: "En ligne",
};