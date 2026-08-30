import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  useAdminArticleDetail,
  useUpdateAdminArticle,
  useDeleteAdminArticle,
  useAdminCategoriesList,
  fetchAdminArticleById,
} from "@/stores";
import type { AdminArticlePayload } from "@/data/articles";
import { SITE } from "@/data/site";
import {
  ArticleDetailHeader,
  ArticleContentCard,
  ArticleCoverSidebarCard,
  ArticleSettingsSidebarCard,
} from "@/components/pages/admin/articles/detail";

export const Route = createFileRoute("/_admin/ecosystem/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminArticleById(params.id);
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.item?.title
          ? `Article : ${loaderData.item.title} | ${SITE.name}`
          : `Détail article | ${SITE.name}`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: article, isLoading } = useAdminArticleDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });
  const updateMutation = useUpdateAdminArticle();
  const removeMutation = useDeleteAdminArticle();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminArticlePayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (article && !isEditing) {
      setForm({
        slug: article.slug,
        title: article.title,
        author: article.author,
        category_id: article.categoryId,
        published_at: article.date,
        excerpt: article.excerpt,
        cover: article.cover,
        body: article.body,
      });
    }
  }, [article, isEditing]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!article || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/articles" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Article introuvable.
        </div>
      </>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: article.id, payload: form },
      {
        onSuccess: () => {
          toast.success("Article modifié");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      slug: article.slug,
      title: article.title,
      author: article.author,
      category_id: article.categoryId,
      published_at: article.date,
      excerpt: article.excerpt,
      cover: article.cover,
      body: article.body,
    });
    setIsEditing(false);
  };

  return (
    <>
      <ArticleDetailHeader
        isEditing={isEditing}
        isPending={updateMutation.isPending}
        onBack={() => navigate({ to: "/articles" })}
        onCancel={handleCancel}
        onSave={handleSave}
        onStartEdit={() => setIsEditing(true)}
        onDelete={() => setToDelete(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ArticleContentCard
            isEditing={isEditing}
            article={article}
            form={form}
            onChangeForm={setForm}
          />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <ArticleCoverSidebarCard
            isEditing={isEditing}
            article={article}
            form={form}
            onChangeForm={setForm}
          />
          <ArticleSettingsSidebarCard
            isEditing={isEditing}
            article={article}
            form={form}
            onChangeForm={setForm}
            categories={categories}
          />
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(article.id, {
            onSuccess: () => {
              toast.success("Article supprimé");
              navigate({ to: "/articles" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${article.title}" ?`}
      />
    </>
  );
}