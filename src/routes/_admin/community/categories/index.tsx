import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { UserRoundPlus, GraduationCap, Wallet, Plus } from "lucide-react";
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
  const { categories } = useCommunityCategories({ includeInactive: true });
  const [createOpen, setCreateOpen] = useState(false);
  const active = categories.filter((c) => c.isActive).length;

  return (
    <>
      <PageHeader
        title="Statistiques de la communauté"
        description="Gestion des catégories de la communaité"
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

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/community/posts" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Publications
        </Link>

        <Link to="/community/categories" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Wallet className="h-4 w-4" /> Catégories
        </Link>

        <Link to="/community/reports" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Signalement
        </Link>
      </div>

      <CategoriesManager />
    </>
  );
}