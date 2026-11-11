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
export const MAX_ATTACHMENTS = 2;
export const MAX_ATTACHMENT_MB = 1;

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

export type CommentSort = "oldest" | "recent" | "popular";

export const COMMENT_SORT_LABELS: Record<CommentSort, string> = {
  oldest: "Plus anciens",
  recent: "Plus récents",
  popular: "Populaires",
};

export const MAX_COMMENT_LENGTH = 5000;

export type APIComment = {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  author: { id: string; name: string; photo: string | null; role: AuthorRole };
  isPostAuthor: boolean;
  isBestAnswer: boolean;
  isMine: boolean;
  status: PostStatus;
  replyTo: { commentId: string; authorId: string; authorName: string; authorRole: AuthorRole } | null;
  repliesCount: number;
  reactionsTotal: number;
  reactions: Record<string, number>;
  myReaction: string | null;
  createdAt: string;
  editedAt: string | null;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canHide: boolean;
    canReply: boolean;
    canReact: boolean;
    canReport: boolean;
  };
  hiddenReason: string | null;
  hiddenAt: string | null;
};

export type CommentsListParams = {
  page?: number;
  perPage?: number;
  sort?: CommentSort;
  authorRole?: AuthorRole | "";
};

export type ReactionType = "like" | "love" | "celebrate" | "support" | "insightful" | "funny";

export const REACTION_TYPES: ReactionType[] = ["like", "love", "celebrate", "support", "insightful", "funny"];

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: "👍", label: "J'aime" },
  love: { emoji: "❤️", label: "J'adore" },
  celebrate: { emoji: "🎉", label: "Bravo" },
  support: { emoji: "🤝", label: "Soutien" },
  insightful: { emoji: "💡", label: "Instructif" },
  funny: { emoji: "😄", label: "Drôle" },
};

export type ReactionTarget = "posts" | "comments";

export type ReactionState = {
  myReaction: ReactionType | null;
  reactions: Partial<Record<ReactionType, number>>;
  reactionsTotal: number;
};

export type APIReactor = {
  id: string;
  type: ReactionType;
  reactedAt: string;
  user: { id: string; name: string; photo: string | null; role: AuthorRole };
};

export type ReportReason = "spam" | "harassment" | "inappropriate" | "misinformation" | "off_topic" | "other";

export const REPORT_REASONS: ReportReason[] = ["spam", "harassment", "inappropriate", "misinformation", "off_topic", "other"];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam ou publicité",
  harassment: "Harcèlement",
  inappropriate: "Contenu inapproprié",
  misinformation: "Désinformation",
  off_topic: "Hors sujet",
  other: "Autre",
};

export type PostModerationAction = "pin" | "unpin" | "lock" | "unlock" | "hide" | "unhide";
export type CommentModerationAction = "hide" | "unhide";

export type ReportResult = {
  id: string;
  level: "admin" | "instructor";
  status: string;
  message: string
};

export type ReactorsParams = { page?: number; perPage?: number; type?: ReactionType | ""; role?: AuthorRole | "" };

export const formatFileSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} o` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`

export const formatPostDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
