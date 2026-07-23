export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

export type APIAdminContactListItem = {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  service: string;
  customService: string | null;
  status: ContactStatus;
  adminNotes: string | null;
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminContactDetail = APIAdminContactListItem & {
  message: string;
};

export interface AdminContactStatusPayload {
  status: ContactStatus;
  admin_notes?: string;
}

export const CONTACT_STATUS_BADGES: Record<ContactStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground border-border",
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};