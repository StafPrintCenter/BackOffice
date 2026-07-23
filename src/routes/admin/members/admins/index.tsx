import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminAdminsList, useInviteAdminAdmin } from "@/stores/useAdminsStore";
import { type APIAdminAdminListItem, type AdminLevel, ADMIN_LEVEL_BADGES, ADMIN_LEVEL_LABELS } from "@/data/admins";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/admins/")({
  head: () => ({
    meta: [{ title: `Administrateurs | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminAdmins,
});

const schema = z.object({
  first_name: z.string().trim().min(1, "Le prénom est requis"),
  last_name: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().trim().email("E-mail invalide"),
  level: z.enum(["default", "super_admin", "editor"]),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { first_name: "", last_name: "", email: "", level: "default" };

function AdminAdmins() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAdminsList({ perPage: 100 });
  const inviteMutation = useInviteAdminAdmin();

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
    inviteMutation.mutate(parsed.data, {
      onSuccess: () => { toast.success("Invitation envoyée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de l'invitation"),
    });
  };

  return (
    <AdminShell>
      <PageHeader
        title="Administrateurs"
        description="Gérez les comptes administrateurs et invitez de nouveaux membres."
        action={<Button onClick={openInvite}><UserPlus className="mr-1 h-4 w-4" /> Inviter un admin</Button>}
      />

      <DataTable<APIAdminAdminListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["fullname", "email"]}
        onView={(r) => navigate({ to: "/admin/members/admins/$id", params: { id: r.id } })}
        columns={[
          {
            key: "fullname",
            label: "Administrateur",
            render: (r) => (
              <div>
                <div className="font-medium">{r.fullname}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "level",
            label: "Niveau",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ADMIN_LEVEL_BADGES[r.level] ?? "bg-muted text-muted-foreground"}`}>
                {ADMIN_LEVEL_LABELS[r.level] ?? r.level}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span
                className={
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                  (r.isPending
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : r.isBlocked
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : r.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border")
                }
              >
                {r.isPending ? "Invitation en attente" : r.isBlocked ? "Bloqué" : r.isActive ? "Actif" : "Inactif"}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Ajouté le",
            render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>,
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inviter un administrateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Prénom</Label>
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                {errors.first_name && <p className="mt-1 text-xs text-destructive">{errors.first_name}</p>}
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                {errors.last_name && <p className="mt-1 text-xs text-destructive">{errors.last_name}</p>}
              </div>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label>Niveau</Label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as AdminLevel })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {(Object.keys(ADMIN_LEVEL_LABELS) as AdminLevel[]).map((lvl) => (
                  <option key={lvl} value={lvl}>{ADMIN_LEVEL_LABELS[lvl]}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={inviteMutation.isPending}>Envoyer l'invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}