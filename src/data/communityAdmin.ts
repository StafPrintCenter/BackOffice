import type { AuthorRole, PostStatus } from "@/data/community";

export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportLevel = "instructor" | "admin";
export type ReportTargetType = "post" | "comment";
export type ResolveAction = "dismiss" | "hide" | "delete";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "En attente", resolved: "Traité", dismissed: "Rejeté",
};
export const REPORT_LEVEL_LABELS: Record<ReportLevel, string> = {
  admin: "Admin", instructor: "Formateurs",
};
export const TARGET_TYPE_LABELS: Record<ReportTargetType, string> = {
  post: "Publication", comment: "Commentaire",
};
export const RESOLVE_ACTION_LABELS: Record<ResolveAction, { label: string; hint: string }> = {
  dismiss: { label: "Rejeter le signalement", hint: "Le contenu reste en ligne. Les signalants sont informés." },
  hide: { label: "Masquer le contenu", hint: "Le contenu est masqué ; l'auteur reçoit le motif." },
  delete: { label: "Supprimer le contenu", hint: "Suppression définitive (avec ses commentaires ou réponses)." },
};
/** Libellés d'action enregistrée dans `resolution.action` */
export const RESOLUTION_LABELS: Record<string, string> = {
  dismissed: "Rejeté", hidden: "Contenu masqué", deleted: "Contenu supprimé", deleted_by_author: "Supprimé par son auteur",
};

export type APIReportActor = { id: string; name: string; photo: string | null; role: AuthorRole };

export type APIReportTarget = {
  type: ReportTargetType;
  id: string;
  exists: boolean;
  postId: string;
  title: string | null;
  excerpt: string;
  status: PostStatus;
  author: APIReportActor | null;
  trainingId: string | null;
  trainingTitle: string | null;
  category: string | null;
  /** Présent uniquement sur le détail */
  body?: string;
};

export type APIReport = {
  id: string;
  status: ReportStatus;
  level: ReportLevel;
  reason: string;
  details: string | null;
  reportedAt: string;
  reporter: APIReportActor | null;
  target: APIReportTarget;
  resolution: { action: string; note: string | null; by: APIReportActor | null; at: string } | null;
  /** Forme non documentée : seule la présence est utilisée */
  escalation: unknown | null;
  /** Présent uniquement sur le détail */
  reportsOnTarget?: number;
};

export type ReportsStats = { pending: number; resolved: number; dismissed: number };

export type ReportsListParams = {
  page?: number;
  perPage?: number;
  status?: ReportStatus | "";
  level?: ReportLevel | "";
  reason?: string;
  targetType?: ReportTargetType | "";
  trainingId?: string;
};

export type CommunityStats = {
  periodDays: number;
  totals: { posts: number; comments: number; reactions: number; hiddenPosts: number; hiddenComments: number };
  period: {
    posts: number; comments: number; reactions: number;
    postsByRole: Partial<Record<AuthorRole, number>>;
    commentsByRole: Partial<Record<AuthorRole, number>>;
  };
  reports: { pendingAdmin: number; pendingInstructor: number; resolved: number; dismissed: number };
  topPosts: { id: string; title: string; commentsCount: number; reactionsCount: number }[];
};

export type CategoryPayload = {
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
};

export const DEFAULT_CATEGORY_COLOR = "#2563eb";