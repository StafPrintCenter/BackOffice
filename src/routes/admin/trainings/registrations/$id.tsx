import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Phone, GraduationCap, Calendar, UserCheck, Clock, Pencil, Save, X, MessageSquare, CheckCircle2, XCircle, User, ShieldCheck, Sparkles, } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminTrainingRegistrationDetail, useUpdateAdminTrainingRegistrationStatus, } from "@/stores/useTrainingRegistrationsStore";
import { type TrainingRegistrationStatus, type AdminTrainingRegistrationStatusPayload, getStatusBadge, getStatusLabel, STATUS_LABELS, } from "@/data/trainingRegistrations";
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
          toast.success("Statut mis à jour avec succès");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  return (
    <AdminShell>
      {/* Barre supérieure d'actions */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: "/admin/trainings/registrations" })}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Retour aux inscriptions
        </Button>

        {reg && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1.5" /> Traiter la demande
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1.5" /> Annuler
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" /> Enregistrer
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Chargement du dossier...</p>
        </div>
      ) : !reg || !form ? (
        <div className="rounded-2xl border bg-card p-12 text-center">
          <p className="text-muted-foreground">Demande d'inscription introuvable.</p>
        </div>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* Hero Banner Candidat */}
          <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/admin/trainings/catalogs/$id"
                    params={{ id: reg.trainingId }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    <GraduationCap className="h-3.5 w-3.5" /> {reg.training}
                  </Link>

                  <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${getStatusBadge(reg.status)}`}>
                    {getStatusLabel(reg.status)}
                  </span>
                </div>

                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    {reg.firstName} {reg.lastName}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dossier d'inscription N° <span className="font-mono">{reg.id.substring(0, 8)}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
                  <a href={`mailto:${reg.email}`} className="hover:text-primary inline-flex items-center gap-1.5 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {reg.email}
                  </a>
                  <span className="text-border">•</span>
                  <a href={`tel:${reg.phone}`} className="hover:text-primary inline-flex items-center gap-1.5 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {reg.phone}
                  </a>
                </div>
              </div>

              {/* Statut lié au compte élève */}
              {reg.studentId ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Compte élève créé</p>
                    <p className="text-[11px] opacity-80">Rattaché à l'espace membre</p>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl bg-muted/50 border p-3 text-xs text-muted-foreground">
                  <User className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Pas de compte élève</p>
                    <p className="text-[11px] opacity-75">Aucun profil associé</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Colonne Principale (Détails) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 font-display text-base font-semibold border-b pb-3 text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" /> Informations transmises
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-muted-foreground">Créneau souhaité</p>
                      <p className="font-medium text-foreground">{reg.schedulePreference || "Non spécifié"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-muted-foreground">Reçu le</p>
                      <p className="font-medium text-foreground">{formatDate(reg.createdAt)}</p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                    {reg.programRead ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <span className="text-muted-foreground">
                      Programme pédagogique consulté :{" "}
                      <b className="text-foreground">{reg.programRead ? "Oui, pris en connaissance" : "Non consultée"}</b>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Message / Motivation du candidat</Label>
                  <div className="rounded-xl bg-muted/30 p-4 text-xs leading-relaxed text-foreground border whitespace-pre-wrap">
                    {reg.notes || "Aucun message ou note laissé par le candidat."}
                  </div>
                </div>
              </div>

              {/* Historique de révision admin */}
              {(reg.reviewedBy || reg.reviewedAt) && (
                <div className="rounded-2xl border bg-muted/20 p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {reg.reviewedBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Dernière révision par : <b className="text-foreground">{reg.reviewedBy}</b></span>
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

            {/* Panneau Latéral : Traitement & Notes Interne */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Suivi de la candidature
                  </span>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Statut du dossier</Label>
                    {isEditing ? (
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v as TrainingRegistrationStatus })}
                      >
                        <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusBadge(reg.status)}`}>
                          {getStatusLabel(reg.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Notes administratives internes</Label>
                    {isEditing ? (
                      <Textarea
                        rows={6}
                        value={form.admin_notes ?? ""}
                        onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                        placeholder="Renseignez vos retours d'appels, suivis ou précisions..."
                        className="mt-1 text-xs leading-relaxed"
                      />
                    ) : (
                      <div className="mt-1.5 rounded-xl bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap border min-h-22.5">
                        {reg.adminNotes || "Aucune note interne enregistrée."}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 text-xs" onClick={handleSave} disabled={updateStatus.isPending}>
                        {updateStatus.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> Sauvegarder</>}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleCancel}>
                        <X className="h-3.5 w-3.5 mr-1" /> Annuler
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