import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Rocket, Ban, CheckCircle, Briefcase, MapPin, Building2, Calendar, FileText, ListChecks, Settings2, Plus, Eye, EyeOff, Link2, Clock, CheckCircle2, GraduationCap, Users2, Laptop, ChevronRight, } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminJobOfferDetailWithApplicants, useUpdateAdminJobOffer, useDeleteAdminJobOffer, usePublishAdminJobOffer, useDisableAdminJobOffer, useReactivateAdminJobOffer, } from "@/stores/useJobOffersStore";
import type { AdminJobOfferUpdatePayload, APIAdminJobOffer, JobOfferWorkMode, JobEducationLevel } from "@/data/jobOffers";
import { JOB_OFFER_CONTRACT_LABELS, JOB_OFFER_WORK_MODE_LABELS, JOB_EDUCATION_LEVEL_LABELS, JOB_OFFER_STATUS_LABELS, getJobOfferStatusBadge, } from "@/data/jobOffers";
import { JOB_APPLICATION_STATUS_LABELS, getJobApplicationStatusBadge } from "@/data/jobApplications";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/jobs/offers/$id")({
  head: () => ({
    meta: [
      { title: `Offre d'emploi | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: JobOfferDetail,
});

interface EditForm {
  title: string;
  summary: string;
  department: string;
  workMode: JobOfferWorkMode;
  location: string;
  numPositions: string;
  description: string;
  missions: string[];
  educationLevel: JobEducationLevel | "";
  expiresAt: string;
}

function toEditForm(o: APIAdminJobOffer): EditForm {
  return {
    title: o.title ?? "",
    summary: o.summary ?? "",
    department: o.department ?? "",
    workMode: o.workMode,
    location: o.location ?? "",
    numPositions: o.numPositions != null ? String(o.numPositions) : "",
    description: o.description ?? "",
    missions: o.missions.length > 0 ? o.missions : [""],
    educationLevel: o.educationLevel ?? "",
    expiresAt: o.expiresAt ? o.expiresAt.slice(0, 16) : "",
  };
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function JobOfferDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { offer, applicants, isLoading } = useAdminJobOfferDetailWithApplicants(id);
  const updateMutation = useUpdateAdminJobOffer();
  const removeMutation = useDeleteAdminJobOffer();
  const publishMutation = usePublishAdminJobOffer();
  const disableMutation = useDisableAdminJobOffer();
  const reactivateMutation = useReactivateAdminJobOffer();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (offer && !form) setForm(toEditForm(offer));
  }, [offer, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!offer || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/jobs/offers" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Offre introuvable.</p>
      </AdminShell>
    );
  }

  const isDraft = offer.status === "draft";
  const isPublished = offer.status === "published";
  const isDisabled = offer.status === "disabled";

  const handleCancel = () => {
    setForm(toEditForm(offer));
    setIsEditing(false);
  };

  const handleSave = () => {
    const payload: AdminJobOfferUpdatePayload = {
      title: form.title,
      summary: form.summary,
      department: form.department || undefined,
      work_mode: form.workMode,
      location: form.workMode === "teletravail" ? undefined : form.location || undefined,
      num_positions: form.numPositions ? Number(form.numPositions) : undefined,
      description: form.description,
      missions: form.missions.map((m) => m.trim()).filter(Boolean),
      education_level: form.educationLevel || undefined,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    updateMutation.mutate(
      { id: offer.id, payload },
      {
        onSuccess: () => { toast.success("Offre modifiée"); setIsEditing(false); },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handlePublish = () => {
    publishMutation.mutate(offer.id, {
      onSuccess: () => toast.success("Offre publiée"),
      onError: () => toast.error("Erreur lors de la publication"),
    });
  };

  const handleDisable = () => {
    disableMutation.mutate(offer.id, {
      onSuccess: () => toast.success("Offre désactivée"),
      onError: () => toast.error("Erreur lors de la désactivation"),
    });
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(offer.id, {
      onSuccess: () => toast.success("Offre réactivée"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  const renderSalary = () => {
    const min = offer.salaryMin != null && offer.salaryMin !== "" ? Number(offer.salaryMin).toLocaleString() : null;
    const max = offer.salaryMax != null && offer.salaryMax !== "" ? Number(offer.salaryMax).toLocaleString() : null;
    if (min && max) return `${min} - ${max} FCFA`;
    if (min) return `${min} FCFA`;
    return "-";
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/jobs/offers" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Modifier
              </Button>
              {isDraft && (
                <Button size="sm" onClick={handlePublish} disabled={publishMutation.isPending}>
                  <Rocket className="h-4 w-4 mr-1" /> Publier
                </Button>
              )}
              {isPublished && (
                <Button variant="outline" size="sm" onClick={handleDisable} disabled={disableMutation.isPending}>
                  <Ban className="h-4 w-4 mr-1" /> Désactiver
                </Button>
              )}
              {isDisabled && (
                <Button size="sm" onClick={handleReactivate} disabled={reactivateMutation.isPending}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Réactiver
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
                <FileText className="h-4 w-4 text-primary" /> Détails principaux
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Titre du poste</Label>
                  <Input className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>

                <div>
                  <Label>Résumé court</Label>
                  <Input className="mt-1" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Département</Label>
                    <Input className="mt-1" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div>
                    <Label>Mode de travail</Label>
                    <select
                      value={form.workMode}
                      onChange={(e) => setForm({ ...form, workMode: e.target.value as JobOfferWorkMode })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.entries(JOB_OFFER_WORK_MODE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                    </select>
                  </div>
                  {form.workMode !== "teletravail" && (
                    <div>
                      <Label>Lieu</Label>
                      <Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                  )}
                  <div>
                    <Label>Nombre de postes</Label>
                    <Input type="number" min={1} className="mt-1" value={form.numPositions} onChange={(e) => setForm({ ...form, numPositions: e.target.value })} />
                  </div>
                  <div>
                    <Label>Niveau d'étude requis</Label>
                    <select
                      value={form.educationLevel}
                      onChange={(e) => setForm({ ...form, educationLevel: e.target.value as JobEducationLevel | "" })}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">- Non spécifié -</option>
                      {Object.entries(JOB_EDUCATION_LEVEL_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Description du poste</Label>
                  <Textarea rows={5} className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Missions
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, missions: [...form.missions, ""] })}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {form.missions.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Mission n°${i + 1}`}
                      value={m}
                      onChange={(e) => {
                        const arr = [...form.missions];
                        arr[i] = e.target.value;
                        setForm({ ...form, missions: arr });
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, missions: form.missions.filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
              Le type de contrat, le profil recherché et la fourchette salariale ne sont plus modifiables après création.
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
                <Settings2 className="h-4 w-4 text-primary" /> Échéance
              </div>
              <div>
                <Label>Date d'expiration</Label>
                <Input type="datetime-local" className="mt-1" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getJobOfferStatusBadge(offer.status)}`}>
                  {JOB_OFFER_STATUS_LABELS[offer.status]}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${offer.isVisible ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-transparent"}`}>
                  {offer.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {offer.isVisible ? "Publique" : "Masquée"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{JOB_OFFER_CONTRACT_LABELS[offer.contractType]}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 font-medium">
                  <Laptop className="h-3 w-3" /> {JOB_OFFER_WORK_MODE_LABELS[offer.workMode]}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                  {offer.applicationsCount} candidature{offer.applicationsCount > 1 ? "s" : ""}
                </span>
                {offer.createdBy && <span className="rounded-full bg-muted px-2.5 py-0.5">Par {offer.createdBy}</span>}
              </div>

              <h1 className="mt-3 font-display text-3xl font-bold">{offer.title}</h1>
              <p className="mt-1 text-sm italic text-muted-foreground">{offer.summary}</p>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>

            {offer.missions.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Missions
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {offer.missions.map((m, i) => (<li key={i}>{m}</li>))}
                </ul>
              </div>
            )}

            {offer.profile.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Briefcase className="h-4 w-4 text-primary" /> Profil recherché
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {offer.profile.map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
                <p className="text-[11px] text-muted-foreground/70">Champ verrouillé après création - non modifiable via l'admin.</p>
              </div>
            )}

            {/* Candidatures reçues */}
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-base">
                <Users2 className="h-4 w-4 text-primary" /> Candidatures ({applicants.length})
              </div>
              {applicants.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune candidature reçue pour le moment.</p>
              ) : (
                <div className="divide-y rounded-lg border">
                  {applicants.map((a) => (
                    <Link
                      key={a.id}
                      to="/admin/jobs/applications/$id"
                      params={{ id: a.id }}
                      className="flex items-center justify-between gap-3 p-3 text-sm hover:bg-muted/40"
                    >
                      <div>
                        <div className="font-medium">{a.firstName} {a.lastName}</div>
                        <div className="text-xs text-muted-foreground">
                          Envoyée le {new Date(a.submittedAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getJobApplicationStatusBadge(a.status)}`}>
                          {JOB_APPLICATION_STATUS_LABELS[a.status]}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="border-b pb-3">
                <div className="text-xs font-medium text-muted-foreground">Salaire proposé</div>
                <div className="font-display text-2xl font-bold text-primary mt-1">{renderSalary()}</div>
                <p className="mt-1 text-[11px] text-muted-foreground/70">Verrouillé après création.</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Département : <strong className="text-foreground">{offer.department || "-"}</strong></span>
                </div>

                {offer.workMode !== "teletravail" && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                    <span>Lieu : <strong className="text-foreground">{offer.location || "-"}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users2 className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Postes ouverts : <strong className="text-foreground">{offer.numPositions ?? "-"}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Niveau requis : <strong className="text-foreground">{offer.educationLevel ? JOB_EDUCATION_LEVEL_LABELS[offer.educationLevel] : "-"}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Slug : <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{offer.slug}</code></span>
                </div>

                <div className="border-t pt-3 space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Créée le :</span>
                    <span className="font-medium text-foreground">{formatDate(offer.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Modifiée le :</span>
                    <span className="font-medium text-foreground">{formatDate(offer.updatedAt)}</span>
                  </div>
                  {offer.publishedAt && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Publiée le :</span>
                      <span className="font-medium text-foreground">{formatDate(offer.publishedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Expire le :</span>
                    <span className="font-medium text-foreground">{formatDate(offer.expiresAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(offer.id, {
            onSuccess: () => { toast.success("Offre supprimée"); navigate({ to: "/admin/jobs/offers" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${offer.title}" ?`}
      />
    </AdminShell>
  );
}