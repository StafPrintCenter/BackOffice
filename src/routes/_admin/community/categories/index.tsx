import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flag, NotebookPen, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site";
import { SITE } from "@/data/site";
import { useCommunityCategories } from "@/stores/useCommunityStore";
import { CategoriesManager } from "@/components/pages/community/categories";

export const Route = createFileRoute("/_admin/community/categories/")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Catégorie de la communauté | ${SITE.name}` },
      { name: "description", content: "Consultez les catégorie de la communauté." },
    ]
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const navigate = useNavigate();
  const { categories } = useCommunityCategories({ includeInactive: true });
  const [createOpen, setCreateOpen] = useState(false);
  const active = categories.filter((c) => c.isActive).length;

  return (
    <>
      <PageHeader
        title="Statistiques de la communauté"
        description="Gestion des catégories de la communaité"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/community/posts" })}>
              <NotebookPen className="h-4 w-4" /> Publications
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/reports" })}>
              <Flag className="h-4 w-4" /> Signalement
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/stats" })}>
              <TrendingUp className="h-4 w-4" /> Statistiques
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{categories.length} catégorie(s), dont {active} active(s).</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      <CategoriesManager />
    </>
  );
}