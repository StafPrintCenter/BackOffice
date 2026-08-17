import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminAppointmentDetail, useUpdateAdminAppointmentStatus, fetchAdminAppointmentById } from "@/stores/useAppointmentsStore";
import { type AppointmentStatus } from "@/data/appointments";
import { SITE } from "@/data/site";
import {
  AppointmentDetailHeader,
  AppointmentDetailContent,
  AppointmentHandlingInfo,
  AppointmentSidebar,
} from "@/components/pages/admin/appointments/detail";

export const Route = createFileRoute("/_admin/appointments/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminAppointmentById(params.id);
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.item?.subject
          ? `Rendez-vous : ${loaderData.item.subject} | ${SITE.name}`
          : `Rendez-vous | ${SITE.name}`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: a, isLoading } = useAdminAppointmentDetail(id);
  const updateStatus = useUpdateAdminAppointmentStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (a) {
      setStatus(a.status);
      setNotes(a.adminNotes ?? "");
    }
  }, [a]);

  const handleCancel = () => {
    if (a) {
      setStatus(a.status);
      setNotes(a.adminNotes ?? "");
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    updateStatus.mutate(
      { id, payload: { status, admin_notes: notes } },
      {
        onSuccess: () => {
          toast.success("Statut et notes mis à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!a) {
    return <p className="text-muted-foreground">Rendez-vous introuvable.</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/appointments" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      <div className="max-w-5xl space-y-6">
        <AppointmentDetailHeader appointment={a} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AppointmentDetailContent appointment={a} />
            <AppointmentHandlingInfo handledBy={a.handledBy} handledAt={a.handledAt} />
          </div>

          <AppointmentSidebar
            currentStatus={a.status}
            adminNotes={a.adminNotes}
            isEditing={isEditing}
            status={status}
            notes={notes}
            isPending={updateStatus.isPending}
            onEditToggle={setIsEditing}
            onStatusChange={setStatus}
            onNotesChange={setNotes}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
}
