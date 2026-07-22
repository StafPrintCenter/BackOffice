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