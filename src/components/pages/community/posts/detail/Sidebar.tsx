import { Link } from "@tanstack/react-router";
import { Eye, GraduationCap, MessageCircle, SmilePlus } from "lucide-react";
import { formatPostDate, type APIPost } from "@/data/community";
import { AuthorRoleBadge } from "@/components/pages/community/shared";
import { UserAvatar } from "@/components/site";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{children}</span>
  </div>
);

export function PostSidebar({ post: p, totalPosts }: { post: APIPost; totalPosts?: number | null }) {
  const authorLink =
    p.author.role === "instructor" ? { to: "/members/instructors/$id" as const }
      : p.author.role === "student" ? { to: "/members/students/$id" as const }
        : null;

  return (
    <div className="h-fit space-y-4 lg:sticky lg:top-6">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold">Auteur</h2>
        <div className="flex items-center gap-3">
          <UserAvatar
            name={p.author.name}
            photo={p.author.photo}
            className="size-11 shrink-0"
            imageClassName="object-cover"
            fallbackClassName="bg-primary/10 text-xs font-bold text-primary"
          />
          <div className="min-w-0">
            {authorLink ? (
              <Link {...authorLink} params={{ id: p.author.id }} className="block truncate font-medium text-primary hover:underline">{p.author.name}</Link>
            ) : (
              <span className="block truncate font-medium">{p.author.name}</span>
            )}
            <AuthorRoleBadge role={p.author.role} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <Row label="Catégorie">
          <span style={{ color: p.category.color }}>{p.category.name}</span>
        </Row>
        <Row label="Portée">{p.scope === "training" ? "Formation" : "Générale"}</Row>
        {totalPosts !== undefined && <Row label="Publications">{totalPosts ?? "…"}</Row>}
        {p.training && (
          <Row label="Formation">
            <Link to="/trainings/catalogs/$id" params={{ id: p.training.id }} className="inline-flex items-center gap-1 text-primary hover:underline">
              <GraduationCap className="h-3.5 w-3.5" /> {p.training.title}
            </Link>
          </Row>
        )}
        <Row label="Publiée le">{formatPostDate(p.createdAt)}</Row>
        {p.editedAt && <Row label="Modifiée le">{formatPostDate(p.editedAt)}</Row>}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: MessageCircle, value: p.commentsCount, label: "Commentaires" },
          { icon: SmilePlus, value: p.reactionsTotal, label: "Réactions" },
          { icon: Eye, value: p.viewsCount, label: "Vues" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-xl border bg-card p-3">
            <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
            <div className="mt-1 text-lg font-bold">{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}