import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Flag, TrendingUp, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { CommunityFeed } from "@/components/pages/community/posts/home";
import { PostFormDialog } from "@/components/pages/community/shared";

export const Route = createFileRoute("/_admin/community/posts/")({
  head: () => ({
    meta: [
      { title: `Communauté | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Communauté"
          description="Discussions, questions et ressources des membres."
        />

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Publier
        </Button>
      </div>

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/community/categories" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <LayoutGrid className="h-4 w-4" /> Catégories
        </Link>

        <Link to="/community/reports" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Flag className="h-4 w-4" /> Signalement
        </Link>

        <Link to="/community/stats" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <TrendingUp className="h-4 w-4" /> Statistiques
        </Link>
      </div>

      <div className="pt-6">
        <CommunityFeed />
      </div>
      <PostFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}