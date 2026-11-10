import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Flag, TrendingUp, LayoutGrid, MessagesSquare } from "lucide-react";
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
  const [totalPosts, setTotalPosts] = useState<number | null>(null);

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

      <div className="grid items-start gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <CommunityFeed onTotalChange={setTotalPosts} />
        <aside className="rounded-2xl border bg-card p-5" aria-live="polite">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessagesSquare className="h-4 w-4 text-primary" />
            Publications
          </div>
          <p className="mt-2 text-2xl font-bold">{totalPosts ?? "—"}</p>
          <p className="text-xs text-muted-foreground">
            {totalPosts === null
              ? "Chargement du total…"
              : `publication${totalPosts > 1 ? "s" : ""} correspondant aux filtres`}
          </p>
        </aside>
      </div>
      <PostFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}