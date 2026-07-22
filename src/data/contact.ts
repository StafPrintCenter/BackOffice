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