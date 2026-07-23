import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Megaphone, ArrowRight } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/site";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/")({
  head: () => ({
    meta: [
      { title: `Newsletter | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminNewsletter,
});

function AdminNewsletter() {
  return (
    <AdminShell>
      <PageHeader title="Newsletter" description="Gérez vos abonnés et vos campagnes d'emailing." />
      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          to="/admin/newsletter/subscribers"
          className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div className="mt-4 font-display text-xl font-bold">Abonnés</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez, bloquez, réactivez ou supprimez les abonnés à la newsletter.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
            Gérer les abonnés <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          to="/admin/newsletter/campaigns"
          className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div className="mt-4 font-display text-xl font-bold">Campagnes</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez et envoyez des campagnes d'emailing à vos abonnés.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
            Gérer les campagnes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>
    </AdminShell>
  );
}
