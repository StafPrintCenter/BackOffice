import { Link } from "@tanstack/react-router";
import { ExternalLink, GraduationCap } from "lucide-react";
import { AuthorRoleBadge, HiddenBadge } from "@/components/pages/community/shared";
import type { APIReportTarget } from "@/data/communityAdmin";

export function ReportTarget({ target: t, full }: { target: APIReportTarget; full?: boolean }) {
  const link = t.exists ? (
    t.type === "comment"
      ? <Link to="/community/posts/$id" params={{ id: t.postId }} search={{ comment: t.id }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Voir le commentaire</Link>
      : <Link to="/community/posts/$id" params={{ id: t.postId }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Voir la publication</Link>
  ) : <span className="text-xs text-muted-foreground">Contenu supprimé</span>;

  return (
    <div className="space-y-1.5 rounded-lg bg-muted/40 p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {t.title && <span className="font-medium text-foreground">{t.title}</span>}
        {t.category && <span>· {t.category}</span>}
        {t.status === "hidden" && <HiddenBadge />}
      </div>
      <p className={`whitespace-pre-line text-sm ${full ? "" : "line-clamp-3"}`}>{full ? (t.body ?? t.excerpt) : t.excerpt}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {t.author && <span className="inline-flex items-center gap-1.5">Auteur : <b className="font-medium text-foreground">{t.author.name}</b> <AuthorRoleBadge role={t.author.role} /></span>}
        {t.trainingTitle && <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {t.trainingTitle}</span>}
        {link}
      </div>
    </div>
  );
}