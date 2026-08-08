import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminInstructorsList, useInviteAdminInstructor } from "@/stores/useInstructorsStore";
import type { APIAdminInstructor, AdminInstructorInvitePayload } from "@/data/instructors";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/members/instructors/")({
  head: () => ({
    meta: [
      { title: `Instructeurs | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInstructors,
});

const schema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = { firstName: "", lastName: "", email: "" };

function statusLabel(i: APIAdminInstructor) {
  if (i.isBlocked) return "Bloqué";
  if (i.isPending) return "Invitation en attente";
  if (i.needsApproval) return "À approuver";
  if (i.isActive) return "Actif";
  return "Inactif";
}

function statusBadge(i: APIAdminInstructor) {
  if (i.isBlocked) return "bg-destructive/10 text-destructive";
  if (i.isPending) return "bg-sky-500/10 text-sky-600";
  if (i.needsApproval) return "bg-amber-500/10 text-amber-600";
  if (i.isActive) return "bg-emerald-500/10 text-emerald-600";
  return "bg-muted text-muted-foreground";
}

function AdminInstructors() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminInstructorsList({ perPage: 100 });
  const inviteMutation = useInviteAdminInstructor();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openInvite = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload: AdminInstructorInvitePayload = {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
    };

    inviteMutation.mutate(payload, {
      onSuccess: () => { toast.success("Invitation envoyée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de l'invitation"),
    });
  };

  return (
    <>
      <PageHeader title="Instructeurs" description="Formateurs invités ou auto-inscrits sur la plateforme." />
      <DataTable<APIAdminInstructor>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "email"]}
        onCreate={openInvite}
        onView={(r) => navigate({ to: "/members/instructors/$id", params: { id: r.id } })}
        columns={[
          {
            key: "name",
            label: "Instructeur",
            render: (r) => (
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "registrationSource",
            label: "Origine",
            render: (r) => (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {r.registrationSource === "invited" ? "Invité" : r.registrationSource === "self_registered" ? "Auto-inscrit" : "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(r)}`}>
                {statusLabel(r)}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Créé le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString("fr-FR")}
              </span>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Inviter un instructeur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prénom</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label>Nom</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={inviteMutation.isPending}>Envoyer l'invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}