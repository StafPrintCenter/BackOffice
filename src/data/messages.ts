export type ContactMessageStatus = "new" | "in_progress" | "resolved" | "closed";

export type APIAdminMessageListItem = {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  service: string;
  customService: string | null;
  status: ContactMessageStatus;
  adminNotes: string | null;
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminMessageDetail = APIAdminMessageListItem & {
  message: string;
};

export interface AdminMessageStatusPayload {
  status: ContactMessageStatus;
  admin_notes?: string;
}