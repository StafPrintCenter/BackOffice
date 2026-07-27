import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Rocket, Ban, CheckCircle, Briefcase, MapPin, Building2, Calendar, FileText, ListChecks, Settings2, Plus, Eye, EyeOff, Link2, Clock, CheckCircle2 } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminJobOfferDetail, useUpdateAdminJobOffer, useDeleteAdminJobOffer, usePublishAdminJobOffer, useDisableAdminJobOffer, useReactivateAdminJobOffer, } from "@/stores/useJobOffersStore";
import type { AdminJobOfferPayload, APIAdminJobOffer } from "@/data/jobOffers";
import { JOB_OFFER_CONTRACT_LABELS, JOB_OFFER_STATUS_LABELS, getJobOfferStatusBadge } from "@/data/jobOffers";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/jobs/offers/$id")({
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
  department: string;
  location: string;
  description: string;
  responsibilities: string[];
  expiresAt: string;
}

// Sécurisation de la conversion en tableau pour les listes
function parseArrayField(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch { }
    }
    return trimmed ? trimmed.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  }
  return [];
}

function toEditForm(o: APIAdminJobOffer): EditForm {
  const resp = parseArrayField(o.responsibilities);
  return {
    title: o.title ?? "",
    department: o.department ?? "",
    location: o.location ?? "",
    description: o.description ?? "",
    responsibilities: resp.length > 0 ? resp : [""],
    expiresAt: o.expiresAt ? o.expiresAt.slice(0, 16) : "",
  };
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function JobOfferDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: offer, isLoading } = useAdminJobOfferDetail(id);
  const updateMutation = useUpdateAdminJobOffer();
  const removeMutation = useDeleteAdminJobOffer();
  const publishMutation = usePublishAdminJobOffer();
  const disableMutation = useDisableAdminJobOffer();
  const reactivateMutation = useReactivateAdminJobOffer();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (offer && !form) {
      setForm(toEditForm(offer));
    }
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
    const cleanResponsibilities = form.responsibilities
      .map((r) => r.trim())
      .filter(Boolean);

    const payload: AdminJobOfferPayload = {
      title: form.title,
      department: form.department || null,
      location: form.location || null,
      description: form.description,
      responsibilities: cleanResponsibilities,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
    };

    updateMutation.mutate(
      { id: offer.id, payload },
      {
        onSuccess: () => {
          toast.success("Offre modifiée");
          setIsEditing(false);
        },
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

    if (min && max) {
      return `${min} - ${max} FCFA`;
    }
    if (min) {
      return `${min} FCFA`;
    }
    return "-";
  };

  const responsibilitiesList = parseArrayField(offer.responsibilities);
  const requirementsList = parseArrayField(offer.requirements);

  return (
    <AdminShell>
      {/* Action Header */}
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
        /* MODE ÉDITION */
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
                <FileText className="h-4 w-4 text-primary" /> Détails Principaux
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Titre du poste</Label>
                  <Input
                    className="mt-1"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Département</Label>
                    <Input
                      className="mt-1"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Lieu</Label>
                    <Input
                      className="mt-1"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description du poste</Label>
                  <Textarea
                    rows={5}
                    className="mt-1"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Responsabilités & Missions
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForm({ ...form, responsibilities: [...form.responsibilities, ""] })}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
                </Button>
              </div>

              <div className="space-y-2">
                {form.responsibilities.map((resp, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Mission n°${i + 1}`}
                      value={resp}
                      onChange={(e) => {
                        const arr = [...form.responsibilities];
                        arr[i] = e.target.value;
                        setForm({ ...form, responsibilities: arr });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setForm({ ...form, responsibilities: form.responsibilities.filter((_, idx) => idx !== i) })}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
                <Settings2 className="h-4 w-4 text-primary" /> Échéance & Paramètres
              </div>

              <div>
                <Label>Date d'expiration</Label>
                <Input
                  type="datetime-local"
                  className="mt-1"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MODE LECTURE (TOUTES LES DONNÉES DE L'API Y SONT) */
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              {/* Badges de Statut & Visibilité */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getJobOfferStatusBadge(offer.status)}`}>
                  {JOB_OFFER_STATUS_LABELS[offer.status]}
                </span>

                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${offer.isVisible ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-transparent"
                  }`}>
                  {offer.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {offer.isVisible ? "Publique" : "Masquée"}
                </span>

                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{JOB_OFFER_CONTRACT_LABELS[offer.contractType]}</span>

                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">
                  {offer.applicationsCount} candidature{offer.applicationsCount > 1 ? "s" : ""}
                </span>

                {offer.createdBy && <span className="rounded-full bg-muted px-2.5 py-0.5">Par {offer.createdBy}</span>}
              </div>

              <h1 className="mt-3 font-display text-3xl font-bold">{offer.title}</h1>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>

            {responsibilitiesList.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Missions & Responsabilités
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {responsibilitiesList.map((r, i) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            )}

            {requirementsList.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Briefcase className="h-4 w-4 text-primary" /> Exigences du poste
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {requirementsList.map((r, i) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar des métadonnées (Slug, Dates, Statuts) */}
          <div className="lg:sticky lg:top-6 h-fit space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="border-b pb-3">
                <div className="text-xs font-medium text-muted-foreground">Salaire proposé</div>
                <div className="font-display text-2xl font-bold text-primary mt-1">
                  {renderSalary()}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Département : <strong className="text-foreground">{offer.department || "-"}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>Lieu : <strong className="text-foreground">{offer.location || "-"}</strong></span>
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
            onSuccess: () => {
              toast.success("Offre supprimée");
              navigate({ to: "/admin/jobs/offers" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${offer.title}" ?`}
      />
    </AdminShell>
  );
}