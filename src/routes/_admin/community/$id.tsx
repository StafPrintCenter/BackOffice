import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { usePostDetail } from "@/stores/useCommunityStore";
import { PostDetailView } from "@/components/community/detail";

export const Route = createFileRoute("/_admin/community/$id")({
  head: () => ({ meta: [{ title: `Publication | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { post, isLoading, error } = usePostDetail(id);

  const back = (
    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/community" })}>
      <ArrowLeft className="mr-1 h-4 w-4" /> Communauté
    </Button>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…</div>;
  }

  if (!post) {
    return (
      <>
        <div className="mb-6">{back}</div>
        <p className="text-muted-foreground">{error ? error.message : "Publication introuvable."}</p>
      </>
    );
  }

  return (
    <>
      <div className="-mb-4">{back}</div>
      <PostDetailView post={post} />
    </>
  );
}