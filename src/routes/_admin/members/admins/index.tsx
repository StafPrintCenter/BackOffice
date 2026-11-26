import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeader } from "@/components/site";
import { AdminInviteDialog, adminTableColumns } from "@/components/pages/members/admins/home";
import { useAdminAdminsList, useInviteAdminAdmin } from "@/stores/useAdminsStore";
import type { AdminAdminInvitePayload, APIAdminAdminListItem } from "@/data/admins";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/members/admins/")({
  head: () => ({
    meta: [{ title: `Administrateurs | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminAdmins,
});

function AdminAdmins() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAdminsList({ perPage: 100 });
  const inviteMutation = useInviteAdminAdmin();
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleInvite = (payload: AdminAdminInvitePayload) => {
    inviteMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Invitation envoyée");
        setInviteOpen(false);
      },
      onError: () => toast.error("Erreur lors de l'invitation"),
    });
  };

  return (
    <>
      <PageHeader
        title="Administrateurs"
        description="Gérez les comptes administrateurs et invitez de nouveaux membres."
      />
      <DataTable<APIAdminAdminListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email"]}
        onCreate={() => setInviteOpen(true)}
        onView={(admin) => navigate({ to: "/members/admins/$id", params: { id: admin.id } })}
        columns={adminTableColumns}
      />
      <AdminInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInvite}
        isPending={inviteMutation.isPending}
      />
    </>
  );
}
