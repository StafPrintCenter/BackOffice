import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  useAdminAnnouncementDetail,
  useUpdateAdminAnnouncement,
  useDeleteAdminAnnouncement,
  useAdminAnnouncementAnalytics,
  fetchAdminAnnouncementById,
} from "@/stores/useAnnouncementsStore";
import { SITE } from "@/data/site";
import type { EditForm } from "@/data/announcements";
import {
  AnnouncementDetailHeader,
  AnnouncementContentCard,
  AnnouncementAnalyticsCard,
  AnnouncementConfigSidebarCard,
  AnnouncementPublicationSidebarCard,
  AnnouncementActionSidebarCard,
} from "@/components/pages/admin/announces/detail";

export const Route = createFileRoute("/_admin/announces/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminAnnouncementById(params.id);
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.item?.title
          ? `${loaderData.item.title} | ${SITE.name}`
          : `Détail annonce | ${SITE.name}`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnnouncementDetail,
});

function toEditForm(a: NonNullable<ReturnType<typeof useAdminAnnouncementDetail>["item"]>): EditForm {
  return {
    type: a.type,
    position: a.position,
    style: a.style ?? undefined,
    title: a.title,
    message: a.message,
    icon: a.icon ?? "",
    isClosable: a.isClosable,
    priority: String(a.priority ?? ""),
    isEnabled: a.isEnabled,
    publishedAt: a.publishedAt ? a.publishedAt.slice(0, 16) : "",
    expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : "",
    targetPages: Array.isArray(a.targetPages) ? [...a.targetPages] : [],
    actionLabel: a.action?.label ?? "",
    actionType: a.action?.type ?? "link",
    actionUrl: a.action?.url ?? "",
    actionTarget: a.action?.target ?? "_self",
  };
}

function AnnouncementDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: announcement, isLoading } = useAdminAnnouncementDetail(id);
  const { analytics } = useAdminAnnouncementAnalytics(id);
  const updateMutation = useUpdateAdminAnnouncement();
  const removeMutation = useDeleteAdminAnnouncement();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (announcement && !isEditing) {
      setForm(toEditForm(announcement));
    }
  }, [announcement, isEditing]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!announcement || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/announces" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Annonce introuvable.</p>
      </>
    );
  }

  const handleCancel = () => {
    setForm(toEditForm(announcement));
    setIsEditing(false);
  };

  const handleSave = () => {
    const cleanedTargetPages = form.targetPages
      .map((p) => p.trim())
      .filter(Boolean);

    const action = form.actionLabel.trim()
      ? {
        label: form.actionLabel.trim(),
        type: form.actionType,
        url: form.actionUrl.trim() || undefined,
        target: form.actionTarget,
      }
      : undefined;

    updateMutation.mutate(
      {
        id: announcement.id,
        payload: {
          type: form.type,
          position: form.position,
          style: form.style,
          title: form.title,
          message: form.message,
          icon: form.icon || undefined,
          action: action ? JSON.stringify(action) : undefined,
          is_closable: form.isClosable,
          priority: form.priority === "" ? undefined : Number(form.priority),
          is_enabled: form.isEnabled,
          published_at: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
          expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
          target_pages: cleanedTargetPages.length > 0 ? cleanedTargetPages : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Annonce modifiée");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  return (
    <>
      <AnnouncementDetailHeader
        isEditing={isEditing}
        isPending={updateMutation.isPending}
        onBack={() => navigate({ to: "/announces" })}
        onCancel={handleCancel}
        onSave={handleSave}
        onStartEdit={() => setIsEditing(true)}
        onDelete={() => setToDelete(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AnnouncementContentCard
            isEditing={isEditing}
            announcement={announcement}
            form={form}
            onChangeForm={setForm}
          />
          <AnnouncementAnalyticsCard analytics={analytics ?? undefined} />
        </div>

        <div className="space-y-6">
          <AnnouncementConfigSidebarCard
            isEditing={isEditing}
            announcement={announcement}
            form={form}
            onChangeForm={setForm}
          />
          <AnnouncementPublicationSidebarCard
            isEditing={isEditing}
            announcement={announcement}
            form={form}
            onChangeForm={setForm}
          />
          <AnnouncementActionSidebarCard
            isEditing={isEditing}
            announcement={announcement}
            form={form}
            onChangeForm={setForm}
          />
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(announcement.id, {
            onSuccess: () => {
              toast.success("Annonce supprimée");
              navigate({ to: "/announces" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${announcement.title}" ?`}
      />
    </>
  );
}