import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import {
  useAdminEcosystemSitesList,
  useCreateAdminEcosystemSite,
  useUpdateAdminEcosystemSite,
  useDeleteAdminEcosystemSite
} from "@/stores/useEcosystemSitesStore";
import type { APIAdminEcosystemSite, AdminEcosystemSitePayload } from "@/data/ecosystemSites";
import { SITE } from "@/data/site";
import { CreateEditModal, ecosystemSchema, getEcosystemTableColumns, type EcosystemFormValues } from "@/components/pages/ecosystem/home";

export const Route = createFileRoute("/_admin/ecosystem/")({
  head: () => ({
    meta: [
      { title: `Écosystème | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEcosystemSites,
});

const emptyForm: EcosystemFormValues = {
  name: "",
  description: "",
  url: "",
  logo_key: "",
  category: "outil",
  status: "available",
};

function AdminEcosystemSites() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminEcosystemSitesList({ perPage: 100 });

  const createMutation = useCreateAdminEcosystemSite();
  const updateMutation = useUpdateAdminEcosystemSite();
  const removeMutation = useDeleteAdminEcosystemSite();

  const [dialog, setDialog] = useState<{ open: boolean; row?: APIAdminEcosystemSite }>({ open: false });
  const [form, setForm] = useState<EcosystemFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminEcosystemSite | null>(null);

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setDialog({ open: true });
  };

  const openEdit = (row: APIAdminEcosystemSite) => {
    setForm({
      name: row.name,
      description: row.description ?? "",
      url: row.url,
      logo_key: row.logoKey ?? "",
      category: row.category,
      status: row.status,
    });
    setErrors({});
    setDialog({ open: true, row });
  };

  const submit = () => {
    const parsed = ecosystemSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload: AdminEcosystemSitePayload = parsed.data as AdminEcosystemSitePayload;

    if (dialog.row) {
      updateMutation.mutate(
        { id: dialog.row.id, payload },
        {
          onSuccess: () => {
            toast.success("Site modifié");
            setDialog({ open: false });
          },
          onError: () => toast.error("Erreur lors de la modification"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Site ajouté");
          setDialog({ open: false });
        },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <>
      <PageHeader title="Écosystème" description="Sites et applications de l'écosystème STAF PRINT CENTER." />

      <DataTable<APIAdminEcosystemSite>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "url", "category"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onView={(r) => navigate({ to: "/ecosystem/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={getEcosystemTableColumns()}
      />

      <CreateEditModal
        open={dialog.open}
        onOpenChange={(open) => setDialog({ open, row: dialog.row })}
        form={form}
        onChangeForm={setForm}
        errors={errors}
        isEditing={!!dialog.row}
        onSubmit={submit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Site supprimé");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </>
  );
}