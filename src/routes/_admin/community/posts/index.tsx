import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title="Communauté"
          description="Discussions, questions et ressources des membres."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate({ to: "/community/categories" })}>
                <LayoutGrid className="h-4 w-4" /> Catégories
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

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Publier
        </Button>
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