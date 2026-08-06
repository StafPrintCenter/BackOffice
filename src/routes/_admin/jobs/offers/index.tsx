import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Users, Plus, Trash2 } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminJobOffersList, useCreateAdminJobOffer, useDeleteAdminJobOffer } from "@/stores/useJobOffersStore";
import type { APIAdminJobOffer, AdminJobOfferCreatePayload, JobOfferContractType, JobOfferWorkMode, JobEducationLevel } from "@/data/jobOffers";
import {
  JOB_OFFER_CONTRACT_LABELS, JOB_OFFER_WORK_MODE_LABELS, JOB_EDUCATION_LEVEL_LABELS,
  JOB_OFFER_STATUS_LABELS, getJobOfferStatusBadge,
} from "@/data/jobOffers";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/jobs/offers/")({
  head: () => ({
    meta: [
      { title: `Offres d'emploi | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminJobOffers,
});

const schema = z
  .object({
    title: z.string().trim().min(2).max(255),
    summary: z.string().trim().min(2).max(500),
    department: z.string().trim().max(150).optional(),
    contractType: z.enum(["cdi", "cdd", "stage", "freelance", "alternance"]),
    workMode: z.enum(["presentiel", "hybride", "teletravail"]),
    location: z.string().trim().max(150).optional(),
    numPositions: z.string().optional(),
    description: z.string().trim().min(2),
    missions: z.array(z.string().trim()),
    profile: z.array(z.string().trim()),
    educationLevel: z.enum(["sans_diplome", "bepc", "bac", "bac+2", "bac+3", "master", "doctorat"]).optional(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    publishedAt: z.string().optional(),
    expiresAt: z.string().min(1, "La date d'expiration est requise"),
  })
  .superRefine((v, ctx) => {
    if (v.workMode !== "teletravail" && !v.location?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["location"], message: "Le lieu est requis sauf en télétravail" });
    }
  });
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  title: "",
  summary: "",
  department: "",
  contractType: "cdi",
  workMode: "presentiel",
  location: "",
  numPositions: "",
  description: "",
  missions: [""],
  profile: [""],
  educationLevel: undefined,
  salaryMin: "",
  salaryMax: "",
  publishedAt: "",
  expiresAt: "",
};

function AdminJobOffers() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminJobOffersList({ perPage: 100 });

  const createMutation = useCreateAdminJobOffer();
  const removeMutation = useDeleteAdminJobOffer();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminJobOffer | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const cleaned: FormValues = {
      ...form,
      missions: form.missions.filter((m) => m.trim()),
      profile: form.profile.filter((p) => p.trim()),
      location: form.workMode === "teletravail" ? undefined : form.location,
    };

    const parsed = schema.safeParse(cleaned);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const v = parsed.data;
    const payload: AdminJobOfferCreatePayload = {
      title: v.title,
      summary: v.summary,
      department: v.department || undefined,
      contract_type: v.contractType as JobOfferContractType,
      work_mode: v.workMode as JobOfferWorkMode,
      location: v.workMode === "teletravail" ? undefined : v.location,
      num_positions: v.numPositions ? Number(v.numPositions) : undefined,
      description: v.description,
      missions: v.missions.length > 0 ? v.missions : undefined,
      profile: v.profile.length > 0 ? v.profile : undefined,
      education_level: v.educationLevel as JobEducationLevel | undefined,
      salary_min: v.salaryMin ? Number(v.salaryMin) : undefined,
      salary_max: v.salaryMax ? Number(v.salaryMax) : undefined,
      published_at: v.publishedAt ? new Date(v.publishedAt).toISOString() : undefined,
      expires_at: new Date(v.expiresAt).toISOString(),
    };

    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Offre créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Offres d'emploi" description="Postes ouverts publiés sur le site." />

      <div className="mb-4">
        <Link to="/jobs/applications"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Users className="h-4 w-4" />
          Voir les candidatures
        </Link>
      </div>

      <DataTable<APIAdminJobOffer>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "department", "location"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/jobs/offers/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "title",
            label: "Poste",
            render: (r) => (
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.slug}</div>
              </div>
            ),
          },
          {
            key: "department",
            label: "Département",
            render: (r) => <span className="text-xs">{r.department || "-"}</span>,
          },
          {
            key: "contractType",
            label: "Contrat",
            render: (r) => (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {JOB_OFFER_CONTRACT_LABELS[r.contractType]}
              </span>
            ),
          },
          {
            key: "workMode",
            label: "Mode",
            render: (r) => (
              <div>
                <div className="text-xs font-medium">{JOB_OFFER_WORK_MODE_LABELS[r.workMode]}</div>
                {r.workMode !== "teletravail" && (
                  <div className="text-xs text-muted-foreground">{r.location || "-"}</div>
                )}
              </div>
            ),
          },
          {
            key: "numPositions",
            label: "Postes",
            render: (r) => <span className="text-xs font-mono">{r.numPositions ?? "-"}</span>,
          },
          {
            key: "applicationsCount",
            label: "Candidatures",
            render: (r) => <span className="text-xs font-mono">{r.applicationsCount}</span>,
          },
          {
            key: "expiresAt",
            label: "Expire le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {r.expiresAt ? new Date(r.expiresAt).toLocaleDateString("fr-FR") : "-"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getJobOfferStatusBadge(r.status)}`}>
                {JOB_OFFER_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle offre d'emploi</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre du poste</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label>Résumé court</Label>
              <Input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="Distinct de la description complète" />
              {errors.summary && <p className="text-xs text-destructive mt-1">{errors.summary}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Département</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <Label>Type de contrat</Label>
                <select
                  value={form.contractType}
                  onChange={(e) => setForm({ ...form, contractType: e.target.value as FormValues["contractType"] })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(JOB_OFFER_CONTRACT_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
              <div>
                <Label>Mode de travail</Label>
                <select
                  value={form.workMode}
                  onChange={(e) => setForm({ ...form, workMode: e.target.value as FormValues["workMode"] })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(JOB_OFFER_WORK_MODE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
              {form.workMode !== "teletravail" && (
                <div>
                  <Label>Lieu</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
                </div>
              )}
              <div>
                <Label>Nombre de postes</Label>
                <Input type="number" min={1} value={form.numPositions} onChange={(e) => setForm({ ...form, numPositions: e.target.value })} />
              </div>
              <div>
                <Label>Niveau d'étude requis</Label>
                <select
                  value={form.educationLevel ?? ""}
                  onChange={(e) => setForm({ ...form, educationLevel: (e.target.value || undefined) as JobEducationLevel | undefined })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">- Non spécifié -</option>
                  {Object.entries(JOB_EDUCATION_LEVEL_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>

            {/* Missions */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Missions</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, missions: [...form.missions, ""] })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.missions.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Ex: Gérer la comptabilité"
                      value={m}
                      onChange={(e) => {
                        const arr = [...form.missions];
                        arr[i] = e.target.value;
                        setForm({ ...form, missions: arr });
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, missions: form.missions.filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Profil recherché */}
            <div>
              <div className="flex items-center justify-between">
                <Label>Profil recherché</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, profile: [...form.profile, ""] })}>
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {form.profile.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Ex: Maîtrise Excel"
                      value={p}
                      onChange={(e) => {
                        const arr = [...form.profile];
                        arr[i] = e.target.value;
                        setForm({ ...form, profile: arr });
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => setForm({ ...form, profile: form.profile.filter((_, idx) => idx !== i) })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Salaire minimum</Label>
                <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              </div>
              <div>
                <Label>Salaire maximum</Label>
                <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
              </div>
              <div>
                <Label>Date de publication (optionnel)</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
              </div>
              <div>
                <Label>Date d'expiration</Label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                {errors.expiresAt && <p className="text-xs text-destructive mt-1">{errors.expiresAt}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Offre supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}