import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DataTable, PageHeader } from "@/components/site";
import {
  InstructorInviteDialog,
  instructorTableColumns,
} from "@/components/pages/members/instructors/home";
import type { AdminInstructorInvitePayload, APIAdminInstructor } from "@/data/instructors";
import { SITE } from "@/data/site";
import { useAdminInstructorsList, useInviteAdminInstructor } from "@/stores/useInstructorsStore";

export const Route = createFileRoute("/_admin/members/instructors/")({
  head: () => ({
    meta: [
      { title: `Instructeurs | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInstructors,
});

function AdminInstructors() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminInstructorsList({ perPage: 100 });
  const inviteMutation = useInviteAdminInstructor();
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleInvite = (payload: AdminInstructorInvitePayload) => {
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
        title="Instructeurs"
        description="Formateurs invités ou auto-inscrits sur la plateforme."
      />
      <DataTable<APIAdminInstructor>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "email"]}
        onCreate={() => setInviteOpen(true)}
        onView={(instructor) =>
          navigate({ to: "/members/instructors/$id", params: { id: instructor.id } })
        }
        columns={instructorTableColumns}
      />
      <InstructorInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSubmit={handleInvite}
        isPending={inviteMutation.isPending}
      />
    </>
  );
}
