import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { useAdminCategoryDetail } from "@/stores/useAdminCategoriesStore";

export const Route = createFileRoute("/admin/categories/$id")({
  head: () => ({ meta: [{ title: "Catégorie — Admin" }, { name: "robots", content: "noindex" }] }),
  component: CategoryDetail,
});

function CategoryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: cat, isLoading } = useAdminCategoryDetail(id);

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/categories" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
        </div>
      ) : !cat ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Catégorie introuvable.
          <div className="mt-2"><Link to="/admin/categories" className="text-primary underline">Retour à la liste</Link></div>
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <div>
            <div className={"inline-flex px-3 py-1 rounded-full text-xs mb-3 " + cat.colorClass}>{cat.name}</div>
            <h1 className="font-display text-3xl font-bold">{cat.name}</h1>
            <div className="mt-1 text-sm text-muted-foreground">Slug : <code>{cat.slug}</code></div>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-3">Utilisation</div>
            <ul className="space-y-2 text-sm">
              <li>Thème de formation : <b>{cat.isTrainingTheme ? "Oui" : "Non"}</b></li>
              <li>Catégorie de projet : <b>{cat.isProjectCategory ? "Oui" : "Non"}</b></li>
              <li>Catégorie d'article : <b>{cat.isArticleCategory ? "Oui" : "Non"}</b></li>
              <li>Catégorie newsletter : <b>{cat.isNewsletterCategory ? "Oui" : "Non"}</b></li>
            </ul>
          </div>
        </div>
      )}
    </AdminShell>
  );
}