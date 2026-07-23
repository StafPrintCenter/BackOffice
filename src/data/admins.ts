export type AdminLevel = "default" | "super_admin" | "editor";

export type APIAdminAdminListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  photo: string | null;
  bio: string | null;
  level: AdminLevel;
  isActive: boolean;
  invitationRevokedAt: string | null;
  isBlocked: boolean;
  isPending: boolean;
  blockedAt: string | null;
  invitedBy: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type APIAdminAdminDetail = APIAdminAdminListItem & {
  blockedReason?: string | null;
};

export interface AdminAdminInvitePayload {
  first_name: string;
  last_name: string;
  email: string;
  level: AdminLevel;
}

export interface AdminAdminBlockPayload {
  reason: string;
}

export const ADMIN_LEVEL_LABELS: Record<AdminLevel, string> = {
  default: "Standard",
  super_admin: "Super admin",
  editor: "Éditeur",
};

export const ADMIN_LEVEL_BADGES: Record<AdminLevel, string> = {
  default: "bg-muted text-muted-foreground border-border",
  super_admin: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  editor: "bg-sky-500/10 text-sky-600 border-sky-500/20",
};