import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { usePostDetail } from "@/stores/useCommunityStore";
import { PostDetailView } from "@/components/pages/community/detail";
import { useDynamicPageMetadata } from "@/hooks/useDynamicPageMetadata";

export const Route = createFileRoute("/_admin/community/post/$id")({
  validateSearch: (s: Record<string, unknown>): { comment?: string } => ({
    comment: typeof s.comment === "string" && s.comment ? s.comment : undefined,
  }),
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Détail d'une Publication | ${SITE.name}` },
      { name: "description", content: "Consultez le détail et le contenu de cette notification de votre espace formateur." },
    ],
  }),
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = Route.useParams();
  const { comment } = Route.useSearch();
  const navigate = useNavigate();
  const { post, isLoading, error } = usePostDetail(id);
  useDynamicPageMetadata(
    post ? `${SITE.tool} - ${post.title} | ${SITE.name}` : undefined,
    post?.body,
  );

  const clearFocus = () =>
    navigate({
      to: "/community/post/$id", params: { id }, search: (prev) =>
        ({ ...prev, comment: undefined }), replace: true
    });

  const back = (
    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/community/post" })}>
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
      <PostDetailView post={post} focusCommentId={comment} onClearFocus={clearFocus} />
    </>
  );
}