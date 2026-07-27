import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Users } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminJobOffersList, useCreateAdminJobOffer, useDeleteAdminJobOffer } from "@/stores/useJobOffersStore";
import type { APIAdminJobOffer, AdminJobOfferPayload, JobOfferContractType } from "@/data/jobOffers";
import { JOB_OFFER_CONTRACT_LABELS, JOB_OFFER_STATUS_LABELS, getJobOfferStatusBadge } from "@/data/jobOffers";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/jobs/offers/")({
  head: () => ({
    meta: [
      { title: `Offres d'emploi | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminJobOffers,
});

const schema = z.object({
  title: z.string().trim().min(2).max(255),
  department: z.string().trim().min(1).max(150),
  contractType: z.enum(["cdi", "cdd", "stage", "freelance", "alternance"]),
  location: z.string().trim().min(1).max(150),
  description: z.string().trim().min(2),
  responsibilities: z.string().trim().optional(), // une par ligne
  requirements: z.string().trim().optional(), // une par ligne
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  title: "",
  department: "",
  contractType: "cdi",
  location: "",
  description: "",
  responsibilities: "",
  requirements: "",
  salaryMin: "",
  salaryMax: "",
  publishedAt: "",
  expiresAt: "",
};

function toCsv(linesText?: string): string | undefined {
  const lines = (linesText ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.length > 0 ? lines.join(",") : undefined;
}

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
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const v = parsed.data;
    const payload: AdminJobOfferPayload = {
      title: v.title,
      department: v.department,
      contract_type: v.contractType as JobOfferContractType,
      location: v.location,
      description: v.description,
      responsibilities: toCsv(v.responsibilities),
      requirements: toCsv(v.requirements),
      salary_min: v.salaryMin ? Number(v.salaryMin) : undefined,
      salary_max: v.salaryMax ? Number(v.salaryMax) : undefined,
      published_at: v.publishedAt ? new Date(v.publishedAt).toISOString() : undefined,
      expires_at: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Offre créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Offres d'emploi" description="Postes ouverts publiés sur le site." />

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/admin/jobs/subscribers"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Users className="h-4 w-4"
          />
          Voir les candidatures
        </Link>
      </div>

      <DataTable<APIAdminJobOffer>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "department", "location"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/jobs/offers/$id", params: { id: r.id } })}
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
            render: (r) => <span className="text-xs">{r.department}</span>,
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
            key: "location",
            label: "Lieu",
            render: (r) => <span className="text-xs">{r.location}</span>,
          },
          {
            key: "applicationsCount",
            label: "Candidatures",
            render: (r) => <span className="text-xs font-mono">{r.applicationsCount}</span>,
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Département</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
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
                <Label>Lieu</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label>Missions / Responsabilités (une par ligne)</Label>
              <Textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder={"Gérer la comptabilité\nÉtablir les rapports mensuels"}
              />
            </div>

            <div>
              <Label>Exigences (une par ligne)</Label>
              <Textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder={"Maîtrise Excel\nConnaissance OHADA"}
              />
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
                <Label>Date d'expiration (optionnel)</Label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
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