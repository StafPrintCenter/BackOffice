import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, MessageCircle, Calendar, Clock, User, Pencil, Save, X, UserCheck, } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAppointmentDetail, useUpdateAdminAppointmentStatus } from "@/stores/useAppointmentsStore";
import { APPOINTMENT_STATUS_BADGES, APPOINTMENT_STATUS_LABELS, type AppointmentStatus } from "@/data/appointments";
import { modeLabel, modeIcon } from ".";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/appointments/$id")({
  head: () => ({
    meta: [
      { title: `Rendez-vous | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/appointments" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !a ? (
        <p className="text-muted-foreground">Rendez-vous introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = modeIcon(a.mode);
                  return (
                    <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2.5 py-1 text-xs font-semibold">
                      <Icon className="h-3.5 w-3.5" /> {modeLabel(a.mode)} · {a.duration} min
                    </span>
                  );
                })()}
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGES[a.status]}`}>
                  {APPOINTMENT_STATUS_LABELS[a.status]}
                </span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold">{a.subject}</h1>
              <a href={`mailto:${a.email}`} className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Mail className="h-3.5 w-3.5" /> {a.email}
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contenu principal */}
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center gap-2 border-b pb-3 font-display text-lg font-semibold">
                  <MessageCircle className="h-5 w-5 text-primary" /> Détails du rendez-vous
                </div>

                <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>Contact : <b className="text-foreground">{a.firstName} {a.lastName}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Créneau : <b className="text-foreground">{formatDate(a.scheduledAt)}</b></span>
                  </div>
                  {a.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>WhatsApp : <b className="text-foreground">{a.whatsapp}</b></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Reçu le : <b className="text-foreground">{formatDate(a.createdAt)}</b></span>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {a.message || "Aucun message."}
                </div>
              </div>

              {/* Traitement Admin */}
              {(a.handledBy || a.handledAt) && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
                  {a.handledBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Traité par : <b className="text-foreground">{a.handledBy}</b></span>
                    </div>
                  )}
                  {a.handledAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Le : <b className="text-foreground">{formatDate(a.handledAt)}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Gestion du statut et Notes */}
            <div className="space-y-6">
              <div className="space-y-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi du rendez-vous</span>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Statut actuel</Label>
                    {isEditing ? (
                      <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGES[a.status]}`}>
                          {APPOINTMENT_STATUS_LABELS[a.status]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Notes internes admin</Label>
                    {isEditing ? (
                      <Textarea
                        rows={6}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajouter des notes privées sur le traitement..."
                        className="mt-1 text-xs"
                      />
                    ) : (
                      <div className="mt-1 rounded-xl border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {a.adminNotes || "Aucune note enregistrée."}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                        {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Enregistrer</>}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
