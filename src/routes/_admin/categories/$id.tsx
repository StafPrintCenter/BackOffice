import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  useAdminCategoryDetail,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
  fetchAdminCategoryById,
} from "@/stores/useCategoriesStore";
import type { AdminCategoryPayload } from "@/data/categories";
import { SITE } from "@/data/site";
import {
  CategoryDetailHeader,
  CategoryContentCard,
  CategoryBadgePreviewCard,
  CategoryMetadataCard,
} from "@/components/pages/categories/detail";

export const Route = createFileRoute("/_admin/categories/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminCategoryById(params.id);
    return { item };
  },
  head: ({ loaderData }) => {
    const headTitle = loaderData?.item?.name;
    return {
      meta: [
        {
          title: headTitle
            ? `Catégorie : ${headTitle} | ${SITE.name}`
            : `Détail catégorie | ${SITE.name}`,
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: CategoryDetail,
});

function CategoryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: cat, isLoading } = useAdminCategoryDetail(id);
  const updateMutation = useUpdateAdminCategory();
  const removeMutation = useDeleteAdminCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminCategoryPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (cat && !isEditing) {
      setForm({
        name: cat.name,
        slug: cat.slug,
        color_class: cat.colorClass,
        is_training_theme: cat.isTrainingTheme,
        is_project_category: cat.isProjectCategory,
        is_article_category: cat.isArticleCategory,
        is_newsletter_category: cat.isNewsletterCategory,
      });
    }
  }, [cat, isEditing]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!cat || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/categories" })}>
            Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Catégorie introuvable.
        </div>
      </>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: cat.id, payload: form },
      {
        onSuccess: () => {
          toast.success("Catégorie modifiée");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      color_class: cat.colorClass,
      is_training_theme: cat.isTrainingTheme,
      is_project_category: cat.isProjectCategory,
      is_article_category: cat.isArticleCategory,
      is_newsletter_category: cat.isNewsletterCategory,
    });
    setIsEditing(false);
  };

  return (
    <>
      <CategoryDetailHeader
        isEditing={isEditing}
        isPending={updateMutation.isPending}
        onBack={() => navigate({ to: "/categories" })}
        onCancel={handleCancel}
        onSave={handleSave}
        onStartEdit={() => setIsEditing(true)}
        onDelete={() => setToDelete(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CategoryContentCard
            isEditing={isEditing}
            category={cat}
            form={form}
            onChangeForm={setForm}
          />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <CategoryBadgePreviewCard
            isEditing={isEditing}
            category={cat}
            form={form}
          />
          <CategoryMetadataCard category={cat} />
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(cat.id, {
            onSuccess: () => {
              toast.success("Catégorie supprimée");
              navigate({ to: "/categories" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${cat.name}" ?`}
      />
    </>
  );
}