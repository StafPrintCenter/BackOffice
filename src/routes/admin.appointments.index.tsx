import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Video, Phone, MessageCircle, MapPin } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { appointmentsApi } from "@/api/appointments.api";
import type { Appointment, AppointmentMode, AppointmentStatus } from "@/types";

export const Route = createFileRoute("/admin/appointments/")({
  head: () => ({ meta: [{ title: "Rendez-vous — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAppointments,
});

export const modeLabel = (m: AppointmentMode) => ({ presentiel: "Présentiel", visio: "Visio", telephone: "Téléphone", whatsapp: "WhatsApp" }[m]);
export const modeIcon = (m: AppointmentMode) => ({ presentiel: MapPin, visio: Video, telephone: Phone, whatsapp: MessageCircle }[m]);
export const statusLabel = (s: AppointmentStatus) => ({ en_attente: "En attente", confirme: "Confirmé", refuse: "Refusé", annule: "Annulé", termine: "Terminé" }[s]);
export const statusBadge = (s: AppointmentStatus) => ({
  en_attente: "bg-amber-100 text-amber-700",
  confirme: "bg-emerald-100 text-emerald-700",
  refuse: "bg-rose-100 text-rose-700",
  annule: "bg-muted text-muted-foreground",
  termine: "bg-blue-100 text-blue-700",
}[s]);

function AdminAppointments() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["appointments"], queryFn: appointmentsApi.list });
  const [toDelete, setToDelete] = useState<Appointment | null>(null);
  const remove = useMutation({
    mutationFn: (id: string) => appointmentsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Rendez-vous supprimé"); setToDelete(null); },
  });

  const rows = (data ?? []).slice().sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <AdminShell>
      <PageHeader title="Rendez-vous" description="Prises de rendez-vous depuis le site public." />
      <DataTable<Appointment>
        data={rows}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "subject", "whatsapp"]}
        onView={(r) => navigate({ to: "/admin/appointments/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "scheduledAt", label: "Créneau", render: (r) => {
              const d = new Date(r.scheduledAt);
              return (
                <div>
                  <div className="font-medium text-sm">{d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}</div>
                  <div className="text-xs text-muted-foreground">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {r.duration} min</div>
                </div>
              );
            },
          },
          {
            key: "firstName", label: "Contact", render: (r) => (
              <div>
                <div className="font-medium">{r.firstName} {r.lastName}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "mode", label: "Mode", render: (r) => {
              const Icon = modeIcon(r.mode);
              return <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs"><Icon className="h-3 w-3" />{modeLabel(r.mode)}</span>;
            },
          },
          { key: "subject", label: "Sujet", render: (r) => <div className="max-w-md line-clamp-1 text-xs">{r.subject}</div> },
          { key: "status", label: "Statut", render: (r) => <span className={"rounded-full px-2 py-0.5 text-xs " + statusBadge(r.status)}>{statusLabel(r.status)}</span> },
        ]}
      />
      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer le rendez-vous ?`} />
    </AdminShell>
  );
}
