export type PostType = "discussion" | "question" | "resource" | "announcement";
export type PostStatus = "published" | "hidden";
export type AuthorRole = "admin" | "instructor" | "student";
export type PostSort = "recent" | "popular" | "active";

export const POST_TYPES: PostType[] = ["discussion", "question", "resource", "announcement"];

export const POST_TYPE_LABELS: Record<PostType, string> = {
  discussion: "Discussion",
  question: "Question",
  resource: "Ressource",
  announcement: "Annonce",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  published: "Publiée",
  hidden: "Masquée",
};

export const POST_SORT_LABELS: Record<PostSort, string> = {
  recent: "Plus récentes",
  popular: "Populaires",
  active: "Activité récente",
};

export const AUTHOR_ROLE_LABELS: Record<AuthorRole, string> = {
  admin: "Admin",
  instructor: "Formateur",
  student: "Apprenant",
};

export const MAX_TAGS = 5;
export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_MB = 5;

export type APICommunityCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  postsCount: number | null;
};

export type APIPostAttachment = { name: string; url: string; mime: string; size: number };

export type APIPost = {
  id: string;
  title: string;
  type: PostType;
  excerpt: string;
  tags: string[];
  scope: "general" | "training";
  category: { id: string; name: string; slug: string; color: string };
  training: { id: string; title: string } | null;
  author: { id: string; name: string; photo: string | null; role: AuthorRole };
  isMine: boolean;
  status: PostStatus;
  isPinned: boolean;
  isLocked: boolean;
  bestAnswerId: string | null;
  commentsCount: number;
  reactionsTotal: number;
  reactions: Record<string, number>;
  myReaction: string | null;
  viewsCount: number;
  attachmentsCount: number;
  createdAt: string;
  editedAt: string | null;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canModerate: boolean;
    canHide: boolean;
    canLock: boolean;
    canComment: boolean;
    canReact: boolean;
    canReport: boolean;
  };
  hiddenReason: string | null;
  hiddenAt: string | null;
  /** Présents sur le détail et la création, pas forcément sur la liste */
  body?: string;
  attachments?: APIPostAttachment[];
};

export type PostsListParams = {
  page?: number;
  perPage?: number;
  scope?: "general" | "training" | "";
  categoryId?: string;
  type?: PostType | "";
  authorRole?: AuthorRole | "";
  status?: PostStatus | "";
  mine?: boolean;
  unanswered?: boolean;
  pinned?: boolean;
  query?: string;
  sort?: PostSort;
};

export type CreatePostPayload = {
  title: string;
  body: string;
  categoryId: string;
  trainingId?: string;
  type: PostType;
  tags: string[];
  attachments: File[];
};

export type UpdatePostPayload = {
  title: string;
  body: string;
  categoryId: string;
  type: PostType;
  tags: string[];
};

export const formatFileSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} o` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`

export const formatPostDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";