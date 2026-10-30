import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { CommunityFeed, PostFormDialog } from "@/components/community";

export const Route = createFileRoute("/_admin/community/")({
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
        <div>
          <h1 className="font-display text-2xl font-bold">Communauté</h1>
          <p className="text-sm text-muted-foreground">Discussions, questions et ressources des membres.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-4 w-4" /> Publier</Button>
      </div>

      <CommunityFeed />
      <PostFormDialog mode="create" open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}