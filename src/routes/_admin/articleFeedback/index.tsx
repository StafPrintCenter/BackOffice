import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { useAdminWaitlistList, useDeleteAdminWaitlist } from "@/stores/useWaitlistStore";
import { getWaitlistPlatformBadge, getWaitlistPlatformLabel } from "@/data/waitlist";
import type { APIAdminWaitlistEntry } from "@/data/waitlist";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/")({
  head: () => ({
    meta: [
      { title: `Liste d'attente | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminWaitlist,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function AdminWaitlist() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminWaitlistList({ perPage: 100 });
  const removeMutation = useDeleteAdminWaitlist();

  const [toDelete, setToDelete] = useState<APIAdminWaitlistEntry | null>(null);

  return (
    <>
      <PageHeader
        title="Liste d'attente"
        description="Inscriptions en attente d'ouverture des différents espaces de la plateforme."
      />

      <DataTable<APIAdminWaitlistEntry>
        data={items}
        isLoading={isLoading}
        searchKeys={["email"]}
        onView={(r) => navigate({ to: "/waitlist/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "email",
            label: "Email",
            render: (r) => <span className="font-medium">{r.email}</span>,
          },
          {
            key: "platformName",
            label: "Espace demandé",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getWaitlistPlatformBadge(r.platformName)}`}>
                {getWaitlistPlatformLabel(r.platformName)}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Inscrit le",
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
          },
        ]}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Inscription supprimée de la liste d'attente");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.email}" ?`}
      />
    </>
  );
}