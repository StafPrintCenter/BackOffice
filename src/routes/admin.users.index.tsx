import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { UserPlus, Shield, GraduationCap, User as UserIcon } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete } from "@/components/site";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersApi } from "@/api/extra.api";
import type { AppUser, AppUserRole, AppUserStatus } from "@/types";

export const Route = createFileRoute("/admin/users/")({
  head: () => ({ meta: [{ title: "Utilisateurs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsers,
});

const inviteSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  role: z.enum(["admin", "learner", "user"]),
});

const statusBadge = (s: AppUserStatus) => ({
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-amber-100 text-amber-700",
  blocked: "bg-red-100 text-red-700",
}[s]);
const statusLabel = (s: AppUserStatus) => ({ active: "Actif", suspended: "Suspendu", blocked: "Bloqué" }[s]);

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
  const [tab, setTab] = useState<AppUserRole>("admin");
  const [invite, setInvite] = useState<{ open: boolean; role: AppUserRole }>({ open: false, role: "admin" });
  const [form, setForm] = useState({ name: "", email: "", role: "admin" as AppUserRole });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<AppUser | null>(null);

  const create = useMutation({
    mutationFn: (v: { name: string; email: string; role: AppUserRole }) =>
      usersApi.create({ ...v, status: "active", invitedAt: new Date().toISOString() }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Utilisateur invité"); setInvite({ open: false, role: invite.role }); },
  });
  const patch = useMutation({
    mutationFn: (v: { id: string; changes: Partial<AppUser> }) => usersApi.update(v.id, v.changes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Modifié"); },
  });
  const remove = useMutation({ mutationFn: (id: string) => usersApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openInvite = (role: AppUserRole) => { setForm({ name: "", email: "", role }); setErrors({}); setInvite({ open: true, role }); };
  const submitInvite = () => {
    const parsed = inviteSchema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    create.mutate(parsed.data);
  };

  const list = (role: AppUserRole) => (data ?? []).filter((u) => u.role === role);

  const renderRow = (u: AppUser) => (
    <tr key={u.id} className="border-t hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
          <div><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
        </div>
      </td>
      <td className="px-4 py-3"><span className={"text-xs rounded-full px-2 py-0.5 " + statusBadge(u.status)}>{statusLabel(u.status)}</span></td>
      <td className="px-4 py-3 text-xs text-muted-foreground">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}</td>
      <td className="px-4 py-3">
        {u.role === "admin" ? (
          <div className="flex flex-wrap justify-end gap-1">
            <Select value={u.role} onValueChange={(v) => patch.mutate({ id: u.id, changes: { role: v as AppUserRole } })}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="learner">Apprenant</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
            {u.status !== "suspended" ? (
              <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: u.id, changes: { status: "suspended" } })}>Suspendre</Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: u.id, changes: { status: "active" } })}>Réactiver</Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-1">
            {u.status === "active" && <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: u.id, changes: { status: "suspended" } })}>Suspendre</Button>}
            {u.status === "active" && <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: u.id, changes: { status: "blocked" } })}>Bloquer</Button>}
            {(u.status === "suspended" || u.status === "blocked") && <Button size="sm" variant="outline" onClick={() => patch.mutate({ id: u.id, changes: { status: "active" } })}>Réactiver</Button>}
            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setToDelete(u)}>Supprimer</Button>
          </div>
        )}
      </td>
    </tr>
  );

  const renderTable = (role: AppUserRole) => (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Utilisateur</th><th className="px-4 py-3 text-left">Statut</th><th className="px-4 py-3 text-left">Dernière connexion</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Chargement...</td></tr>
              : list(role).length === 0 ? <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
                : list(role).map(renderRow)}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AdminShell>
      <PageHeader title="Utilisateurs" description="Gestion des admins, apprenants et utilisateurs." actions={
        <Button onClick={() => openInvite(tab)}><UserPlus className="h-4 w-4 mr-1" /> Inviter</Button>
      } />
      <Tabs value={tab} onValueChange={(v) => setTab(v as AppUserRole)}>
        <TabsList>
          <TabsTrigger value="admin"><Shield className="h-4 w-4 mr-1" /> Admins ({list("admin").length})</TabsTrigger>
          <TabsTrigger value="learner"><GraduationCap className="h-4 w-4 mr-1" /> Apprenants ({list("learner").length})</TabsTrigger>
          <TabsTrigger value="user"><UserIcon className="h-4 w-4 mr-1" /> Utilisateurs ({list("user").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="admin" className="mt-4">{renderTable("admin")}</TabsContent>
        <TabsContent value="learner" className="mt-4">{renderTable("learner")}</TabsContent>
        <TabsContent value="user" className="mt-4">{renderTable("user")}</TabsContent>
      </Tabs>

      <Dialog open={invite.open} onOpenChange={(v) => setInvite({ open: v, role: invite.role })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inviter un utilisateur</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}</div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}</div>
            <div>
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AppUserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="learner">Apprenant</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite({ open: false, role: invite.role })}>Annuler</Button>
            <Button onClick={submitInvite}>Envoyer l'invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.name}" ?`} />
    </AdminShell>
  );
}
