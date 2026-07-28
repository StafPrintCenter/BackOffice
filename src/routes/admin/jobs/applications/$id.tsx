import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Phone, Briefcase, GraduationCap, Calendar, UserCheck, Clock, Pencil, Save, X, FileText, Download, CheckCircle2, XCircle, Eye, Paperclip, } from "lucide-react";
import { AdminShell, FilePreviewModal } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminJobApplicationDetail, useUpdateAdminJobApplicationStatus, useAcceptAdminJobApplication, useRejectAdminJobApplication, } from "@/stores/useJobApplicationsStore";
import type { AdminJobApplicationStatusPayload, JobApplicationManualStatus } from "@/data/jobApplications";
import { JOB_APPLICATION_STATUS_LABELS, getJobApplicationStatusBadge } from "@/data/jobApplications";
import { SITE } from "@/data/site";
import { resolveStorageUrl } from "@/lib/file-url";

export const Route = createFileRoute("/admin/jobs/applications/$id")({
  head: () => ({
    meta: [
      { title: `Candidature | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobApplicationDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function JobApplicationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: app, isLoading } = useAdminJobApplicationDetail(id);
  const updateStatus = useUpdateAdminJobApplicationStatus();
  const acceptMutation = useAcceptAdminJobApplication();
  const rejectMutation = useRejectAdminJobApplication();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminJobApplicationStatusPayload | null>(null);

  // État pour la prévisualisation des fichiers (CV, lettre...)
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (app && !form && (app.status === "pending" || app.status === "reviewing" || app.status === "shortlisted")) {
      setForm({ status: app.status, admin_notes: app.adminNotes ?? "" });
    }
  }, [app, form]);

  const handleCancel = () => {
    if (app && (app.status === "pending" || app.status === "reviewing" || app.status === "shortlisted")) {
      setForm({ status: app.status, admin_notes: app.adminNotes ?? "" });
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!form) return;
    updateStatus.mutate(
      { id, payload: form },
      {
        onSuccess: () => {
          toast.success("Candidature mise à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const handleAccept = () => {
    acceptMutation.mutate(id, {
      onSuccess: () => toast.success("Candidature acceptée"),
      onError: () => toast.error("Erreur lors de l'acceptation"),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(id, {
      onSuccess: () => toast.success("Candidature rejetée"),
      onError: () => toast.error("Erreur lors du rejet"),
    });
  };

  const isFinalized = app?.status === "accepted" || app?.status === "rejected";

  // Résolution des URLs sécurisées/complètes des fichiers joints
  const cvUrlResolved = resolveStorageUrl(app?.cvUrl);
  const coverLetterUrlResolved = resolveStorageUrl(app?.coverLetterFileUrl);

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/jobs/applications" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        {app && !isFinalized && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} disabled={acceptMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Accepter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" /> Rejeter
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !app ? (
        <p className="text-muted-foreground">Candidature introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/jobs/offers/$id"
                  params={{ id: app.jobOfferId }}
                  className="inline-flex items-center gap-1.5 rounded bg-muted px-2.5 py-1 text-xs font-semibold hover:underline"
                >
                  <Briefcase className="h-3.5 w-3.5" /> {app.jobOffer}
                </Link>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getJobApplicationStatusBadge(app.status)}`}>
                  {JOB_APPLICATION_STATUS_LABELS[app.status]}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold mt-2">
                {app.firstName} {app.lastName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                <a href={`mailto:${app.email}`} className="text-primary hover:underline inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {app.email}
                </a>
                <a href={`tel:${app.phone}`} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {app.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 font-display text-lg font-semibold border-b pb-3">
                  <FileText className="h-5 w-5 text-primary" /> Dossier de candidature
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-2 text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>
                      Niveau d'étude : <b className="text-foreground">{app.educationLevel}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Reçue le : <b className="text-foreground">{formatDate(app.createdAt)}</b>
                    </span>
                  </div>
                </div>

                {/* Section Fichiers Joints (CV & Lettre) */}
                <div className="space-y-3">
                  <Label className="text-xs font-semibold text-muted-foreground">Documents joints</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Carte CV */}
                    {cvUrlResolved && (
                      <div className="flex flex-col justify-between rounded-xl border bg-muted/20 p-3 gap-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Paperclip className="h-4 w-4 text-primary" />
                          <span>Curriculum Vitae (CV)</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() =>
                              setPreviewFile({
                                url: cvUrlResolved,
                                title: `CV - ${app.firstName} ${app.lastName}`,
                              })
                            }
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Aperçu
                          </Button>
                          <a
                            href={cvUrlResolved}
                            download
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-xs font-medium hover:bg-accent transition-colors"
                            title="Télécharger le CV"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Carte Lettre de motivation (fichier) */}
                    {coverLetterUrlResolved && (
                      <div className="flex flex-col justify-between rounded-xl border bg-muted/20 p-3 gap-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Paperclip className="h-4 w-4 text-primary" />
                          <span>Lettre de motivation</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() =>
                              setPreviewFile({
                                url: coverLetterUrlResolved,
                                title: `Lettre de motivation - ${app.firstName} ${app.lastName}`,
                              })
                            }
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Aperçu
                          </Button>
                          <a
                            href={coverLetterUrlResolved}
                            download
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-xs font-medium hover:bg-accent transition-colors"
                            title="Télécharger la lettre"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lettre de motivation texte */}
                {app.coverLetter && (
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Lettre de motivation (texte)</Label>
                    <div className="mt-1 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap border">
                      {app.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              {/* Traitement Admin */}
              {(app.reviewedBy || app.reviewedAt) && (
                <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {app.reviewedBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>
                        Traité par : <b className="text-foreground">{app.reviewedBy}</b>
                      </span>
                    </div>
                  )}
                  {app.reviewedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        Le : <b className="text-foreground">{formatDate(app.reviewedAt)}</b>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Statut + Notes */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi de la candidature</span>
                  {!isEditing && !isFinalized && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                  )}
                </div>

                {isFinalized ? (
                  <p className="text-xs text-muted-foreground">
                    Cette candidature a été {app.status === "accepted" ? "acceptée" : "rejetée"} et ne peut plus être modifiée manuellement.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Statut actuel</Label>
                      {isEditing && form ? (
                        <Select
                          value={form.status}
                          onValueChange={(v) => setForm({ ...form, status: v as JobApplicationManualStatus })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="reviewing">En cours d'examen</SelectItem>
                            <SelectItem value="shortlisted">Présélectionné</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getJobApplicationStatusBadge(app.status)}`}>
                            {JOB_APPLICATION_STATUS_LABELS[app.status]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Notes internes admin</Label>
                      {isEditing && form ? (
                        <Textarea
                          rows={6}

                          value={form.admin_notes ?? ""}
                          onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                          placeholder="Ajouter des notes privées sur le traitement..."
                          className="mt-1 text-xs"
                        />
                      ) : (
                        <div className="mt-1 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap border">
                          {app.adminNotes || "Aucune note enregistrée."}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                          {updateStatus.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" /> Enregistrer
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-1" /> Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'aperçu du fichier (CV ou Lettre) */}
      <FilePreviewModal
        url={previewFile?.url ?? null}
        title={previewFile?.title ?? ""}
        onClose={() => setPreviewFile(null)}
      />
    </AdminShell>
  );
}