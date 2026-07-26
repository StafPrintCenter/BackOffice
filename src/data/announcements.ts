export type AnnouncementType = "banner" | "popup" | "toast" | "modal";
export type AnnouncementPosition = "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
export type AnnouncementStyle = "info" | "success" | "warning" | "danger" | "neutral";
export type AnnouncementActionType = "link" | "route" | "dismiss";

export interface AnnouncementAction {
  label: string;
  type: AnnouncementActionType;
  url?: string;
  target?: "_self" | "_blank";
}

// Liste et détail renvoient les mêmes champs → un seul type, comme pour APIAdminCategory.
export type APIAdminAnnouncement = {
  id: string;
  type: AnnouncementType;
  position: AnnouncementPosition;
  style: AnnouncementStyle | null;
  title: string;
  message: string;
  icon: string | null;
  action: AnnouncementAction | null;
  isClosable: boolean;
  priority: number;
  isEnabled: boolean;
  isActive: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  targetPages: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export interface AdminAnnouncementPayload {
  type: AnnouncementType;
  position: AnnouncementPosition;
  style?: AnnouncementStyle;
  title: string;
  message: string;
  icon?: string;
  action?: string; // JSON stringifié — construit dans la route juste avant mutate
  is_closable?: boolean;
  priority?: number;
  is_enabled?: boolean;
  published_at?: string;
  expires_at?: string;
  target_pages?: string[]; // buildFormData de la factory le JSON.stringify automatiquement
}

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  banner: "Bannière",
  popup: "Pop-up",
  toast: "Toast",
  modal: "Modale",
};

export const ANNOUNCEMENT_POSITION_LABELS: Record<AnnouncementPosition, string> = {
  top: "Haut",
  bottom: "Bas",
  "top-left": "Haut gauche",
  "top-right": "Haut droite",
  "bottom-left": "Bas gauche",
  "bottom-right": "Bas droite",
  center: "Centre",
};

export const ANNOUNCEMENT_STYLE_LABELS: Record<AnnouncementStyle, string> = {
  info: "Info",
  success: "Succès",
  warning: "Avertissement",
  danger: "Danger",
  neutral: "Neutre",
};

export const ANNOUNCEMENT_STYLE_BADGES: Record<AnnouncementStyle, string> = {
  info: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-transparent",
};

export function getAnnouncementStyleBadge(style: AnnouncementStyle | null): string {
  return style ? ANNOUNCEMENT_STYLE_BADGES[style] : ANNOUNCEMENT_STYLE_BADGES.neutral;
}