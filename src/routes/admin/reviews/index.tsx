import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ListChecks, Send, MessageSquareText, ArrowRight } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/site";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/")({
  head: () => ({
    meta: [
      { title: `Avis & formulaires | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminReviews,
});

const sections = [
  {
    to: "/admin/reviews/forms" as const,
    icon: FileText,
    title: "Formulaires",
    description: "Créez, publiez, désactivez et dupliquez vos formulaires d'avis.",
  },
  {
    to: "/admin/reviews/invites" as const,
    icon: Send,
    title: "Invitations",
    description: "Envoyez et suivez les invitations à répondre.",
  },
  {
    to: "/admin/reviews/responses" as const,
    icon: MessageSquareText,
    title: "Réponses",
    description: "Consultez les réponses reçues.",
  },
];

function AdminReviews() {
  return (
    <AdminShell>
      <PageHeader title="Avis & formulaires" description="Collectez et analysez les retours de vos clients." />
      <div className="grid gap-6 sm:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 font-display text-xl font-bold">{s.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
              Accéder <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}