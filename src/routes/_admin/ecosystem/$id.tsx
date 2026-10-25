import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import {
  useAdminEcosystemSiteDetail,
  useUpdateAdminEcosystemSite,
  useDeleteAdminEcosystemSite,
  fetchAdminEcosystemSiteById
} from "@/stores/useEcosystemSitesStore";
import type { AdminEcosystemSitePayload } from "@/data/ecosystemSites";
import { SITE } from "@/data/site";
import {
  Header,
  ContentCard,
  LogoVariantsCard,
  MetadataSidebarCard,
  HistorySidebarCard,
} from "@/components/pages/ecosystem/detail";

export const Route = createFileRoute("/_admin/ecosystem/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminEcosystemSiteById(params.id);
    return { item };
  },
  head: ({ loaderData }) => {
    const headTitle = loaderData?.item?.name;
    return {
      meta: [
        {
          title: headTitle
            ? `Site : ${headTitle} | ${SITE.name}`
            : `Détail site écosystème | ${SITE.name}`,
        },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: EcosystemSiteDetail,
});

function EcosystemSiteDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: site, isLoading } = useAdminEcosystemSiteDetail(id);
  const updateMutation = useUpdateAdminEcosystemSite();
  const removeMutation = useDeleteAdminEcosystemSite();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminEcosystemSitePayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (site && !isEditing && !form) {
      setForm({
        name: site.name,
        description: site.description,
        url: site.url,
        logo_key: site.logoKey,
        category: site.category,
        status: site.status,
      });
    }
  }, [site, isEditing, form]);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-medium">Chargement des détails du site...</p>
      </div>
    );
  }

  if (!site || !form) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h2 className="text-lg font-semibold">Site introuvable</h2>
        <p className="mt-1 text-sm text-muted-foreground">Le site demandé n'existe pas ou a été supprimé.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ to: "/ecosystem" })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: site.id, payload: form },
      {
        onSuccess: () => {
          toast.success("Site modifié avec succès");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      name: site.name,
      description: site.description,
      url: site.url,
      logo_key: site.logoKey,
      category: site.category,
      status: site.status,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Header
        name={site.name}
        id={site.id}
        isEditing={isEditing}
        isPending={updateMutation.isPending}
        onBack={() => navigate({ to: "/ecosystem" })}
        onCancel={handleCancel}
        onSave={handleSave}
        onStartEdit={() => setIsEditing(true)}
        onDelete={() => setToDelete(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ContentCard
            isEditing={isEditing}
            site={site}
            form={form}
            onChangeForm={setForm}
          />
          <LogoVariantsCard logoVariants={site.logoVariants} />
        </div>

        <div className="space-y-6 lg:col-span-1">
          <MetadataSidebarCard
            isEditing={isEditing}
            site={site}
            form={form}
            onChangeForm={setForm}
          />
          <HistorySidebarCard createdAt={site.createdAt} updatedAt={site.updatedAt} />
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(site.id, {
            onSuccess: () => {
              toast.success("Site supprimé");
              navigate({ to: "/ecosystem" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${site.name}" ?`}
      />
    </div>
  );
}