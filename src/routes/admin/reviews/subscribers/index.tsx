import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminNewsletterSubscribersList, useDeleteAdminNewsletterSubscriber } from "@/stores/useNewsletterSubscribersStore";
import type { APIAdminNewsletterSubscriberListItem } from "@/data/newsletterSubscriber";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/subscribers/")({
  head: () => ({
    meta: [
      { title: `Abonnés newsletter | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminNewsletterSubscribers,
});

function statusBadge(row: APIAdminNewsletterSubscriberListItem) {
  if (row.isBlocked) return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">Bloqué</span>;
  if (!row.isActive) return <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Désabonné</span>;
  return <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">Actif</span>;
}

function AdminNewsletterSubscribers() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminNewsletterSubscribersList({ perPage: 100 });
  const removeMutation = useDeleteAdminNewsletterSubscriber();

  const [toDelete, setToDelete] = useState<APIAdminNewsletterSubscriberListItem | null>(null);

  return (
    <AdminShell>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/newsletter" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      <PageHeader title="Abonnés newsletter" description="Consultez, bloquez, réactivez ou supprimez les abonnés." />
      <DataTable<APIAdminNewsletterSubscriberListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["email", "firstName", "lastName"]}
        onView={(r) => navigate({ to: "/admin/newsletter/subscribers/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "email", label: "Email", render: (r) => <div><div className="font-medium">{r.firstName} {r.lastName}</div><div className="text-xs text-muted-foreground">{r.email}</div></div> },
          {
            key: "categories", label: "Catégories", render: (r) => (
              <div className="flex flex-wrap gap-1">
                {r.categories.length === 0
                  ? <span className="text-xs text-muted-foreground">—</span>
                  : r.categories.map((c) => <span key={c.id} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{c.name}</span>)}
              </div>
            )
          },
          { key: "status", label: "Statut", render: (r) => statusBadge(r) },
          {
            key: "subscribedAt",
            label: "Abonné le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
                  dateStyle: "short", timeStyle: "medium",
                })}
              </span>
            ),
          },
        ]}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Abonné supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer l'abonné "${toDelete?.email}" ?`}
      />
    </AdminShell>
  );
}
