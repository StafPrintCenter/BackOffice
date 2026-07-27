import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Pencil, Trash2, Save, X, Loader2, Rocket, Ban, CheckCircle,
  Briefcase, MapPin, Building2, Calendar, FileText, ListChecks, Settings2, Plus
} from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useAdminJobOfferDetail, useUpdateAdminJobOffer, useDeleteAdminJobOffer,
  usePublishAdminJobOffer, useDisableAdminJobOffer, useReactivateAdminJobOffer,
} from "@/stores/useJobOffersStore";
import type { AdminJobOfferPayload } from "@/data/jobOffers";
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
  responsibilities: string[]; // Géré sous forme de tableau
  expiresAt: string;
}

function toEditForm(o: NonNullable<ReturnType<typeof useAdminJobOfferDetail>["item"]>): EditForm {
  return {
    title: o.title,
    department: o.department ?? "",
    location: o.location ?? "",
    description: o.description,
    responsibilities: o.responsibilities && o.responsibilities.length > 0 ? [...o.responsibilities] : [""],
    expiresAt: o.expiresAt ? o.expiresAt.slice(0, 16) : "",
  };
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
    // Nettoyage des responsabilités vides
    const cleanResponsibilities = form.responsibilities
      .map((r) => r.trim())
      .filter(Boolean);

    // Payload strict aligné sur la validation Laravel
    const payload: Partial<AdminJobOfferPayload> = {
      title: form.title,
      department: form.department || undefined,
      location: form.location || undefined,
      description: form.description,
      responsibilities: cleanResponsibilities,
      expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };

    updateMutation.mutate(
      { id: offer.id, payload: payload as AdminJobOfferPayload },
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

  // Helper pour l'affichage conditionnel du salaire
  const renderSalary = () => {
    if (offer.salaryMin != null && offer.salaryMax != null) {
      return `${offer.salaryMin.toLocaleString()} - ${offer.salaryMax.toLocaleString()} FCFA`;
    }
    if (offer.salaryMin != null) {
      return `${offer.salaryMin.toLocaleString()} FCFA`;
    }
    return "-";
  };

  return (
    <AdminShell>
      {/* Barre d'action d'en-tête */}
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
        /* MODE ÉDITION - 2 COLONNES */
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Colonne Principale (8 Cols) */}
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

            {/* Responsabilités / Missions */}
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

          {/* Sidebar Édition (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 font-semibold text-base border-b pb-3">
                <Settings2 className="h-4 w-4 text-primary" /> Paramètres d'échéance
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
        /* MODE LECTURE - 2 COLONNES */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne Principale (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${getJobOfferStatusBadge(offer.status)}`}>
                  {JOB_OFFER_STATUS_LABELS[offer.status]}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{JOB_OFFER_CONTRACT_LABELS[offer.contractType]}</span>
                <span className="rounded-full bg-muted px-2.5 py-0.5">{offer.applicationsCount} candidature{offer.applicationsCount > 1 ? "s" : ""}</span>
                {offer.createdBy && <span className="rounded-full bg-muted px-2.5 py-0.5">Par {offer.createdBy}</span>}
              </div>

              <h1 className="mt-3 font-display text-3xl font-bold">{offer.title}</h1>
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground leading-relaxed">{offer.description}</p>
            </div>

            {offer.responsibilities && offer.responsibilities.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <ListChecks className="h-4 w-4 text-primary" /> Missions & Responsabilités
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {offer.responsibilities.map((r, i) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            )}

            {offer.requirements && offer.requirements.length > 0 && (
              <div className="rounded-2xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-base">
                  <Briefcase className="h-4 w-4 text-primary" /> Exigences du poste
                </div>
                <ul className="list-inside list-disc text-sm space-y-1.5 text-muted-foreground">
                  {offer.requirements.map((r, i) => (<li key={i}>{r}</li>))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar Fiche Pratique (1/3) */}
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
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>Département : <strong className="text-foreground">{offer.department || "-"}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>Lieu : <strong className="text-foreground">{offer.location || "-"}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Expire le : <strong className="text-foreground">{offer.expiresAt ? new Date(offer.expiresAt).toLocaleString("fr-FR") : "-"}</strong></span>
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