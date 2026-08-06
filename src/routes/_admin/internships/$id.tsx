import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Phone, GraduationCap, Building2, Calendar, UserCheck, Clock, Pencil, Save, X, FileText, Download, CheckCircle2, XCircle, MessageCircleQuestion, Paperclip, Eye } from "lucide-react";
import { AdminShell, FilePreviewModal } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminInternshipRequestDetail, useUpdateAdminInternshipRequestStatus, useRequestInfoAdminInternshipRequest, useAcceptAdminInternshipRequest, useRejectAdminInternshipRequest, } from "@/stores/useInternshipRequestsStore";
import type { AdminInternshipRequestStatusPayload, InternshipRequestManualStatus } from "@/data/internshipRequests";
import { INTERNSHIP_REQUEST_STATUS_LABELS, getInternshipRequestStatusBadge } from "@/data/internshipRequests";
import { SITE } from "@/data/site";
import { resolveStorageUrl } from "@/lib/file-url";

export const Route = createFileRoute("/_admin/internships/$id")({
  head: () => ({
    meta: [
      { title: `Demande de stage | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InternshipRequestDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function InternshipRequestDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: req, isLoading } = useAdminInternshipRequestDetail(id);
  const updateStatus = useUpdateAdminInternshipRequestStatus();
  const requestInfoMutation = useRequestInfoAdminInternshipRequest();
  const acceptMutation = useAcceptAdminInternshipRequest();
  const rejectMutation = useRejectAdminInternshipRequest();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminInternshipRequestStatusPayload | null>(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoError, setInfoError] = useState("");

  const isManualStatus = (s?: string): s is InternshipRequestManualStatus => s === "pending" || s === "under_review";
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (req && !form && isManualStatus(req.status)) {
      setForm({ status: req.status, admin_notes: req.adminNotes ?? "" });
    }
  }, [req, form]);

  const handleCancel = () => {
    if (req && isManualStatus(req.status)) {
      setForm({ status: req.status, admin_notes: req.adminNotes ?? "" });
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!form) return;
    updateStatus.mutate(
      { id, payload: form },
      {
        onSuccess: () => { toast.success("Demande mise à jour"); setIsEditing(false); },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const submitRequestInfo = () => {
    if (!infoMessage.trim()) {
      setInfoError("Le message est requis");
      return;
    }
    setInfoError("");
    requestInfoMutation.mutate(
      { id, payload: { message: infoMessage.trim() } },
      {
        onSuccess: () => {
          toast.success("Demande d'informations envoyée");
          setInfoOpen(false);
          setInfoMessage("");
        },
        onError: () => toast.error("Erreur lors de l'envoi"),
      }
    );
  };

  const handleAccept = () => {
    acceptMutation.mutate(id, {
      onSuccess: () => toast.success("Demande acceptée"),
      onError: () => toast.error("Erreur lors de l'acceptation"),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(id, {
      onSuccess: () => toast.success("Demande rejetée"),
      onError: () => toast.error("Erreur lors du rejet"),
    });
  };

  const isFinalized = req?.status === "accepted" || req?.status === "rejected";
  const cvUrlResolved = resolveStorageUrl(req?.cvUrl);

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/internships" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        {req && !isFinalized && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setInfoOpen(true)}>
              <MessageCircleQuestion className="h-4 w-4 mr-1" /> Demander des infos
            </Button>
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
      ) : !req ? (
        <p className="text-muted-foreground">Demande introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getInternshipRequestStatusBadge(req.status)}`}>
                {INTERNSHIP_REQUEST_STATUS_LABELS[req.status]}
              </span>
              <h1 className="font-display text-2xl font-bold mt-2">{req.firstName} {req.lastName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                <a href={`mailto:${req.email}`} className="text-primary hover:underline inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {req.email}
                </a>
                <a href={`tel:${req.phone}`} className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {req.phone}
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
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>Établissement : <b className="text-foreground">{req.institution || "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span>Filière : <b className="text-foreground">{req.fieldOfStudy || "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Début souhaité : <b className="text-foreground">{req.desiredStartDate ? new Date(req.desiredStartDate).toLocaleDateString("fr-FR") : "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Durée : <b className="text-foreground">{req.duration || "-"}</b></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Reçue le : <b className="text-foreground">{formatDate(req.createdAt)}</b></span>
                  </div>
                </div>

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
                            title: `CV - ${req.firstName} ${req.lastName}`,
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


                {req.message && (
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Message du candidat</Label>
                    <div className="mt-1 rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap border">
                      {req.message}
                    </div>
                  </div>
                )}

                {req.infoRequestedMessage && (
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Informations demandées au candidat</Label>
                    <div className="mt-1 rounded-xl bg-violet-500/5 border border-violet-500/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {req.infoRequestedMessage}
                    </div>
                  </div>
                )}
              </div>

              {(req.reviewedBy || req.reviewedAt) && (
                <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {req.reviewedBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Traité par : <b className="text-foreground">{req.reviewedBy}</b></span>
                    </div>
                  )}
                  {req.reviewedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Le : <b className="text-foreground">{formatDate(req.reviewedAt)}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Statut + Notes */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi de la demande</span>
                  {!isEditing && !isFinalized && isManualStatus(req.status) && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                  )}
                </div>

                {!isManualStatus(req.status) ? (
                  <p className="text-xs text-muted-foreground">
                    {req.status === "additional_info_requested"
                      ? "En attente des informations complémentaires demandées au candidat."
                      : `Cette demande a été ${req.status === "accepted" ? "acceptée" : "rejetée"} et ne peut plus être modifiée manuellement.`}
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Statut actuel</Label>
                      {isEditing && form ? (
                        <Select
                          value={form.status}
                          onValueChange={(v) => setForm({ ...form, status: v as InternshipRequestManualStatus })}
                        >
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="under_review">En cours d'examen</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getInternshipRequestStatusBadge(req.status)}`}>
                            {INTERNSHIP_REQUEST_STATUS_LABELS[req.status]}
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
                          {req.adminNotes || "Aucune note enregistrée."}
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
                )}
              </div>
            </div>
          </div>
        </div>
      )
      }

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Demander des informations</DialogTitle>
            <DialogDescription>
              Ce message sera envoyé au candidat pour lui demander des précisions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                placeholder="Ex : Veuillez nous transmettre votre pièce d'identité..."
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
              />
              {infoError && <p className="mt-1 text-xs text-destructive">{infoError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>Annuler</Button>
            <Button onClick={submitRequestInfo} disabled={requestInfoMutation.isPending}>
              {requestInfoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale d'aperçu du fichier (CV ou Lettre) */}
      <FilePreviewModal
        url={previewFile?.url ?? null}
        title={previewFile?.title ?? ""}
        onClose={() => setPreviewFile(null)}
      />
    </AdminShell >
  );
}