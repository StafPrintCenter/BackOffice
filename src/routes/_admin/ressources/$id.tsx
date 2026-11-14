import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ConfirmDelete, FilePreviewModal } from "@/components/site";
import { Button } from "@/components/ui/button";
import { ResourceContentCard, ResourceDetailHeader, ResourceSettingsSidebarCard } from "@/components/pages/resources/detail";
import { adminResourcePayloadSchema, type AdminResourcePayload, type APIAdminResource } from "@/data/resources";
import { SITE } from "@/data/site";
import {
  fetchAdminResourceById,
  useAdminResourceDetail,
  useDeleteAdminResource,
  useSetAdminResourceVisibility,
  useUpdateAdminResource,
} from "@/stores/useResourcesStore";
import { resolveStorageUrl } from "@/lib/api/file";
import type { ResourceFormValues } from "@/components/pages/resources/home/FormFields";

export const Route = createFileRoute("/_admin/ressources/$id")({
  loader: async ({ params }) => ({ item: await fetchAdminResourceById(params.id) }),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.item?.title ? `Ressource : ${loaderData.item.title} | ${SITE.name}` : `Détail ressource | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResourceDetail,
});

function toForm(resource: APIAdminResource): ResourceFormValues {
  return {
    slug: resource.slug ?? "",
    title: resource.title ?? "",
    category: resource.category,
    price: String(resource.price ?? 0),
    originalPrice: resource.originalPrice == null ? "" : String(resource.originalPrice),
    status: resource.status ?? "",
    short: resource.short ?? "",
    description: resource.description ?? "",
    format: resource.format ?? "",
    meta: resource.meta ?? "",
    includes: resource.includes?.length ? resource.includes : [""],
    outcomes: resource.outcomes?.length ? resource.outcomes : [""],
    audience: resource.audience ?? "",
    requirements: resource.requirements?.length ? resource.requirements : [""],
    license: resource.license ?? "",
    file: null,
  };
}

function toPayload(form: ResourceFormValues): AdminResourcePayload {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title,
    category: form.category,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
    status: form.status.trim() || undefined,
    short: form.short,
    description: form.description,
    format: form.format,
    meta: form.meta,
    includes: form.includes.map((item) => item.trim()).filter(Boolean),
    outcomes: form.outcomes.map((item) => item.trim()).filter(Boolean),
    audience: form.audience,
    requirements: form.requirements.map((item) => item.trim()).filter(Boolean),
    license: form.license,
    file: form.file ?? undefined,
  };
}

function getMimeType(fileName?: string | null): string | undefined {
  const extension = fileName?.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  return undefined;
}

function ResourceDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: resource, isLoading } = useAdminResourceDetail(id);
  const updateMutation = useUpdateAdminResource();
  const visibilityMutation = useSetAdminResourceVisibility();
  const removeMutation = useDeleteAdminResource();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ResourceFormValues | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (resource && !isEditing) setForm(toForm(resource));
  }, [resource, isEditing]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Chargement...</div>;
  }

  if (!resource || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/ressources" })}>Retour</Button>
        </div>
        <p className="text-muted-foreground">Ressource introuvable.</p>
      </>
    );
  }

  const handleCancel = () => {
    setForm(toForm(resource));
    setErrors({});
    setIsEditing(false);
  };

  const handleSave = () => {
    const parsed = adminResourcePayloadSchema.safeParse(toPayload(form));
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    updateMutation.mutate(
      { id: resource.id, payload: parsed.data },
      {
        onSuccess: () => {
          toast.success("Ressource modifiée");
          setIsEditing(false);
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors de la modification"),
      },
    );
  };

  const handleToggleVisibility = () => {
    visibilityMutation.mutate(
      { id: resource.id, isActive: !resource.isActive },
      {
        onSuccess: () => toast.success(resource.isActive ? "Ressource désactivée" : "Ressource activée"),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors du changement de visibilité"),
      },
    );
  };

  const fileUrl = resolveStorageUrl(resource.downloadUrl);

  return (
    <>
      <ResourceDetailHeader
        isEditing={isEditing}
        isPending={updateMutation.isPending}
        isActive={resource.isActive}
        visibilityPending={visibilityMutation.isPending}
        onBack={() => navigate({ to: "/ressources" })}
        onCancel={handleCancel}
        onSave={handleSave}
        onStartEdit={() => { setErrors({}); setIsEditing(true); }}
        onDelete={() => setToDelete(true)}
        onToggleVisibility={handleToggleVisibility}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ResourceContentCard
            isEditing={isEditing}
            form={form}
            onChangeForm={setForm}
            errors={errors}
            fileName={resource.downloadFileName}
          />
        </div>
        <div className="lg:col-span-1">
          <ResourceSettingsSidebarCard
            resource={resource}
            fileUrl={fileUrl}
            onPreview={() => setPreviewOpen(true)}
          />
        </div>
      </div>

      <FilePreviewModal
        url={previewOpen ? fileUrl : null}
        title={resource.downloadFileName || resource.title}
        mimeType={getMimeType(resource.downloadFileName)}
        onClose={() => setPreviewOpen(false)}
      />

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => removeMutation.mutate(resource.id, {
          onSuccess: () => {
            toast.success("Ressource supprimée");
            navigate({ to: "/ressources" });
          },
          onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression"),
        })}
        title={`Supprimer « ${resource.title} » ?`}
      />
    </>
  );
}
