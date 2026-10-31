import { Megaphone, Pin, Lock, EyeOff, HelpCircle, FileText, MessageCircle, CheckCircle2 } from "lucide-react";
import { AUTHOR_ROLE_LABELS, POST_TYPE_LABELS, type AuthorRole, type PostType } from "@/data/community";

const base = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold";

const TYPE_ICON = { discussion: MessageCircle, question: HelpCircle, resource: FileText, announcement: Megaphone };
const TYPE_CLASS: Record<PostType, string> = {
  discussion: "border-border bg-muted/50 text-muted-foreground",
  question: "border-blue-500/20 bg-blue-500/10 text-blue-600",
  resource: "border-teal-500/20 bg-teal-500/10 text-teal-600",
  announcement: "border-violet-500/20 bg-violet-500/10 text-violet-600",
};

export const PostTypeBadge = ({ type }: { type: PostType }) => {
  const Icon = TYPE_ICON[type] ?? MessageCircle;
  return <span className={`${base} ${TYPE_CLASS[type] ?? TYPE_CLASS.discussion}`}><Icon className="h-3 w-3" /> {POST_TYPE_LABELS[type] ?? type}</span>;
};

export const AuthorRoleBadge = ({ role }: { role: AuthorRole }) => (
  <span className={`${base} border-border bg-muted/50 text-muted-foreground`}>{AUTHOR_ROLE_LABELS[role] ?? role}</span>
);

export const PinnedBadge = () => <span className={`${base} border-amber-500/20 bg-amber-500/10 text-amber-600`}><Pin className="h-3 w-3" /> Épinglée</span>;
export const LockedBadge = () => <span className={`${base} border-border bg-muted/50 text-muted-foreground`}><Lock className="h-3 w-3" /> Verrouillée</span>;
export const HiddenBadge = () => <span className={`${base} border-rose-500/20 bg-rose-500/10 text-rose-600`}><EyeOff className="h-3 w-3" /> Masquée</span>;
export const AnsweredBadge = () => <span className={`${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-600`}><CheckCircle2 className="h-3 w-3" /> Résolue</span>;