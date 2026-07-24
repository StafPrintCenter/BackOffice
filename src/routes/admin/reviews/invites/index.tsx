import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Copy, Check, Send, FileText } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminReviewInvitationsList, useCreateAdminReviewInvitation } from "@/stores/useReviewInvitationsStore";
import { useAdminReviewFormsList } from "@/stores/useReviewFormsStore";
import { useAdminProjectsList } from "@/stores/useProjectsStore";
import { type APIAdminReviewInvitation, type AdminReviewInvitationPayload, REVIEW_INVITATION_STATUS_BADGES, REVIEW_INVITATION_STATUS_LABELS, } from "@/data/reviewInvitations";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/invites/")({
  head: () => ({
    meta: [{ title: `Invitations | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminReviewInvites,
});

const schema = z
  .object({
    review_form_id: z.string().min(1, "Le formulaire est requis"),
    project_mode: z.enum(["existing", "custom", "none"]),
    project_id: z.string().optional(),
    project_name: z.string().optional(),
    client_name: z.string().trim().min(2, "Le nom du client est requis"),
    client_email: z.string().trim().email("E-mail invalide"),
    max_responses: z.number().int().min(1).optional(),
    expires_at: z.string().optional(),
  })
  .refine((v) => v.project_mode !== "existing" || !!v.project_id, {
    message: "Sélectionnez un projet",
    path: ["project_id"],
  })
  .refine((v) => v.project_mode !== "custom" || !!v.project_name?.trim(), {
    message: "Le nom du projet est requis",
    path: ["project_name"],
  });

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  review_form_id: "",
  project_mode: "none",
  project_id: "",
  project_name: "",
  client_name: "",
  client_email: "",
  max_responses: undefined,
  expires_at: "",
};

function AdminReviewInvites() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReviewInvitationsList({ perPage: 100 });
  const { items: forms } = useAdminReviewFormsList({ perPage: 100 });
  const { items: projects } = useAdminProjectsList({ perPage: 100 });

  const createMutation = useCreateAdminReviewInvitation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openCreate = () => {
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[i.path.length - 1] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    const payload: AdminReviewInvitationPayload = {
      review_form_id: parsed.data.review_form_id,
      project_id: parsed.data.project_mode === "existing" ? parsed.data.project_id : undefined,
      project_name: parsed.data.project_mode === "custom" ? parsed.data.project_name : undefined,
      client_name: parsed.data.client_name,
      client_email: parsed.data.client_email,
      max_responses: parsed.data.max_responses,
      expires_at: parsed.data.expires_at ? new Date(parsed.data.expires_at).toISOString() : undefined,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Invitation créée");
        setOpen(false);
      },
      onError: () => toast.error("Erreur lors de la création de l'invitation"),
    });
  };

  const copyLink = (e: React.MouseEvent, id: string, link: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Lien copié");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminShell>
      <PageHeader title="Invitations" description="Invitez des clients à répondre à vos formulaires d'avis." />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <Link to="/admin/reviews/forms"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <FileText className="h-4 w-4"
            />
            Gérer les formulaire
          </Link>
        </div>
        <div>
          <Link to="/admin/reviews/responses"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Send className="h-4 w-4"
            />
            Voir les reponses
          </Link>
        </div>
      </div>

      <DataTable<APIAdminReviewInvitation>
        data={items}
        isLoading={isLoading}
        searchKeys={["clientName", "clientEmail", "reviewForm", "projectName"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/reviews/invites/$id", params: { id: r.id } })}
        columns={[
          {
            key: "clientName",
            label: "Client",
            render: (r) => (
              <div>
                <div className="font-medium">{r.clientName}</div>
                <div className="text-xs text-muted-foreground">{r.clientEmail}</div>
              </div>
            ),
          },
          { key: "reviewForm", label: "Formulaire", render: (r) => <span className="text-xs">{r.reviewForm}</span> },
          { key: "project", label: "Projet", render: (r) => <span className="text-xs">{r.project ?? r.projectName ?? "—"}</span> },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_INVITATION_STATUS_BADGES[r.status] ?? "bg-muted text-muted-foreground"}`}>
                {REVIEW_INVITATION_STATUS_LABELS[r.status] ?? r.status}
              </span>
            ),
          },
          {
            key: "responsesCount",
            label: "Réponses",
            render: (r) => <span className="text-xs">{r.responsesCount} / {r.maxResponses}</span>,
          },
          {
            key: "expiresAt",
            label: "Expire le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {r.expiresAt
                  ? new Date(r.expiresAt.replace("Z", "")).toLocaleString("fr-FR", {
                    dateStyle: "short", timeStyle: "short",
                  })
                  : "-s"}
              </span>
            ),
          },
          {
            key: "link",
            label: "Lien",
            render: (r) => {
              const isCopied = copiedId === r.id;
              return (
                <Button size="icon" variant="ghost" onClick={(e) => copyLink(e, r.id, r.link)}>
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              );
            },
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nouvelle invitation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Formulaire</Label>
              <select
                value={form.review_form_id}
                onChange={(e) => setForm({ ...form, review_form_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Choisir —</option>
                {forms.map((f) => (<option key={f.id} value={f.id}>{f.title}</option>))}
              </select>
              {errors.review_form_id && <p className="mt-1 text-xs text-destructive">{errors.review_form_id}</p>}
            </div>

            <div>
              <Label>Projet lié</Label>
              <div className="mt-1 flex gap-2">
                <Button type="button" size="sm" variant={form.project_mode === "none" ? "default" : "outline"} onClick={() => setForm({ ...form, project_mode: "none", project_id: "", project_name: "" })}>
                  Aucun
                </Button>
                <Button type="button" size="sm" variant={form.project_mode === "existing" ? "default" : "outline"} onClick={() => setForm({ ...form, project_mode: "existing", project_name: "" })}>
                  Projet existant
                </Button>
                <Button type="button" size="sm" variant={form.project_mode === "custom" ? "default" : "outline"} onClick={() => setForm({ ...form, project_mode: "custom", project_id: "" })}>
                  Nom libre
                </Button>
              </div>
            </div>

            {form.project_mode === "existing" && (
              <div>
                <Label>Projet</Label>
                <select
                  value={form.project_id}
                  onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Choisir —</option>
                  {projects.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
                {errors.project_id && <p className="mt-1 text-xs text-destructive">{errors.project_id}</p>}
              </div>
            )}
            {form.project_mode === "custom" && (
              <div>
                <Label>Nom du projet</Label>
                <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} />
                {errors.project_name && <p className="mt-1 text-xs text-destructive">{errors.project_name}</p>}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nom du client</Label>
                <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
                {errors.client_name && <p className="mt-1 text-xs text-destructive">{errors.client_name}</p>}
              </div>
              <div>
                <Label>E-mail du client</Label>
                <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} />
                {errors.client_email && <p className="mt-1 text-xs text-destructive">{errors.client_email}</p>}
              </div>
              <div>
                <Label>Réponses max. (optionnel)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.max_responses ?? ""}
                  onChange={(e) => setForm({ ...form, max_responses: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Expire le (optionnel)</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending}>Créer l'invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}