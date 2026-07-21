import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Shield, GraduationCap, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usersApi } from "@/api/extra.api";
import type { AppUser, AppUserRole, AppUserStatus } from "@/types";

export const Route = createFileRoute("/admin/users/$id")({
  head: () => ({ meta: [{ title: "Utilisateur — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UserDetail,
});

const statusBadge = (s: AppUserStatus) => ({
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-amber-100 text-amber-700",
  blocked: "bg-red-100 text-red-700",
}[s]);
const statusLabel = (s: AppUserStatus) => ({ active: "Actif", suspended: "Suspendu", blocked: "Bloqué" }[s]);
const roleIcon = (r: AppUserRole) => r === "admin" ? <Shield className="h-4 w-4" /> : r === "learner" ? <GraduationCap className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />;
const roleLabel = (r: AppUserRole) => ({ admin: "Admin", learner: "Apprenant", user: "Utilisateur" }[r]);

function UserDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["users"], queryFn: usersApi.list });
  const u = data?.find((x) => x.id === id);

  const patch = useMutation({
    mutationFn: (changes: Partial<AppUser>) => usersApi.update(id, changes),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("Modifié"); },
  });

  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/users" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!u ? <p className="text-muted-foreground">Utilisateur introuvable.</p> : (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">{u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold">{u.name}</h1>
                <a href={`mailto:${u.email}`} className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"><Mail className="h-3 w-3" /> {u.email}</a>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">{roleIcon(u.role)} {roleLabel(u.role)}</span>
                  <span className={"text-xs rounded-full px-2 py-0.5 " + statusBadge(u.status)}>{statusLabel(u.status)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Invité le</div>{u.invitedAt ? new Date(u.invitedAt).toLocaleString() : "—"}</div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Dernière connexion</div>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Créé le</div>{new Date(u.createdAt).toLocaleString()}</div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">ID</div><code className="text-xs">{u.id}</code></div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-4">Actions</div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Changer le rôle</div>
                <Select value={u.role} onValueChange={(v) => patch.mutate({ role: v as AppUserRole })}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="learner">Apprenant</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.status !== "active" && <Button variant="outline" onClick={() => patch.mutate({ status: "active" })}>Réactiver</Button>}
                {u.status !== "suspended" && <Button variant="outline" onClick={() => patch.mutate({ status: "suspended" })}>Suspendre</Button>}
                {u.status !== "blocked" && u.role !== "admin" && <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => patch.mutate({ status: "blocked" })}>Bloquer</Button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
