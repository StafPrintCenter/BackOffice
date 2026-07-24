import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Phone, GraduationCap, Calendar, UserCheck, Clock, Pencil, Save, X, MessageSquare, CheckCircle2, XCircle, } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTrainingRegistrationDetail, useUpdateAdminTrainingRegistrationStatus } from "@/stores/useTrainingRegistrationsStore";
import type { TrainingRegistrationStatus, AdminTrainingRegistrationStatusPayload } from "@/data/trainingRegistrations";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/trainings/registrations/$id")({
  head: () => ({
    meta: [
      { title: `Inscription | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingRegistrationDetail,
});

const statusBadge = (s: TrainingRegistrationStatus) =>
({
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  contacted: "bg-sky-100 text-sky-700 border-sky-200",
}[s] ?? "bg-muted text-muted-foreground border-border");

const statusLabel = (s: TrainingRegistrationStatus) =>
({
  pending: "En attente",
  contacted: "Contacté",
}[s] ?? s);

function TrainingRegistrationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: reg, isLoading } = useAdminTrainingRegistrationDetail(id);
  const updateStatus = useUpdateAdminTrainingRegistrationStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminTrainingRegistrationStatusPayload | null>(null);

  useEffect(() => {
    if (reg && !form) {
      setForm({ status: reg.status, admin_notes: reg.adminNotes ?? "" });
    }
  }, [reg, form]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleCancel = () => {
    if (reg) setForm({ status: reg.status, admin_notes: reg.adminNotes ?? "" });
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!form) return;
    updateStatus.mutate(
      { id, payload: form },
      {
        onSuccess: () => {
          toast.success("Inscription mise à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/trainings/registrations" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !reg || !form ? (
        <p className="text-muted-foreground">Inscription introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/trainings/$id"
                  params={{ id: reg.trainingId }}
                  className="inline-flex items-center gap-1.5 rounded bg-muted px-2.5 py-1 text-xs font-semibold hover:underline"
                >
                  <GraduationCap className="h-3.5 w-3.5" /> {reg.training}
                </Link>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(reg.status)}`}>
                  {statusLabel(reg.status)}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold mt-2">{reg.firstName} {reg.lastName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                <a href={`mailto:${reg.email}`} className="text-primary hover:underline inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {reg.email}
                </a>
                <a href={`tel:${reg.phone}`} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {reg.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 font-display text-lg font-semibold border-b pb-3">
                  <MessageSquare className="h-5 w-5 text-primary" /> Détails de l'inscription
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-2 text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Créneau souhaité : <b className="text-foreground">{reg.schedulePreference || "—"}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Reçu le : <b className="text-foreground">{formatDate(reg.createdAt)}</b></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    {reg.programRead ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <span>
                      Programme consulté : <b className="text-foreground">{reg.programRead ? "Oui" : "Non"}</b>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap border">
                  {reg.notes || "Aucune note du candidat."}
                </div>
              </div>

              {/* Traitement Admin */}
              {(reg.reviewedBy || reg.reviewedAt) && (
                <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {reg.reviewedBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Traité par : <b className="text-foreground">{reg.reviewedBy}</b></span>
                    </div>
                  )}
                  {reg.reviewedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Le : <b className="text-foreground">{formatDate(reg.reviewedAt)}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Statut + Notes */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi de l'inscription</span>
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
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v as TrainingRegistrationStatus })}
                      >
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="contacted">Contacté</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(reg.status)}`}>
                          {statusLabel(reg.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Notes internes admin</Label>
                    {isEditing ? (
                      <Textarea
                        rows={6}
                        value={form.admin_notes ?? ""}
                        onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                        placeholder="Ajouter des notes privées sur le traitement..."
                        className="mt-1 text-xs"
                      />
                    ) : (
                      <div className="mt-1 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap border">
                        {reg.adminNotes || "Aucune note enregistrée."}
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