import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle, Ban, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAdminUserDetail,
  useAlertAdminUser,
  useBlockAdminUser,
  useReactivateAdminUser,
} from "@/stores/useUsersStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/users/$id")({
  head: () => ({
    meta: [{ title: `Utilisateur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: UserDetail,
});

function UserDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: user, isLoading } = useAdminUserDetail(id);

  const alertMutation = useAlertAdminUser();
  const blockMutation = useBlockAdminUser();
  const reactivateMutation = useReactivateAdminUser();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({ subject: "", message: "" });
  const [alertErrors, setAlertErrors] = useState<Record<string, string>>({});

  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/users" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Utilisateur introuvable.</p>
      </AdminShell>
    );
  }

  const submitAlert = () => {
    if (!alertForm.subject.trim() || !alertForm.message.trim()) {
      setAlertErrors({
        subject: !alertForm.subject.trim() ? "Le sujet est requis" : "",
        message: !alertForm.message.trim() ? "Le message est requis" : "",
      });
      return;
    }
    setAlertErrors({});
    alertMutation.mutate(
      { id: user.id, subject: alertForm.subject, message: alertForm.message },
      {
        onSuccess: () => {
          toast.success("Alerte envoyée");
          setAlertOpen(false);
          setAlertForm({ subject: "", message: "" });
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'alerte"),
      }
    );
  };

  const submitBlock = () => {
    if (!blockReason.trim()) {
      setBlockError("Le motif est requis");
      return;
    }
    setBlockError("");
    blockMutation.mutate(
      { id: user.id, reason: blockReason },
      {
        onSuccess: () => {
          toast.success("Utilisateur bloqué");
          setBlockOpen(false);
          setBlockReason("");
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(user.id, {
      onSuccess: () => toast.success("Utilisateur réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/users" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <AlertTriangle className="mr-1 h-4 w-4" /> Alerter
          </Button>
          {user.isBlocked ? (
            <Button size="sm" onClick={handleReactivate} disabled={reactivateMutation.isPending}>
              <ShieldCheck className="mr-1 h-4 w-4" /> Débloquer
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setBlockOpen(true)}
            >
              <Ban className="mr-1 h-4 w-4" /> Bloquer
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold">{user.fullname}</h1>
            <span
              className={
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                (user.isBlocked
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : user.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border")
              }
            >
              {user.isBlocked ? "Bloqué" : user.isActive ? "Actif" : "Inactif"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{user.email}</div>

          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div>Rôle : <b className="text-foreground capitalize">{user.role}</b></div>
            <div>Inscrit le : <b className="text-foreground">{new Date(user.createdAt).toLocaleString()}</b></div>
            {user.bio && <div className="sm:col-span-2">Bio : <span className="text-foreground">{user.bio}</span></div>}
            {user.isBlocked && (
              <>
                <div>Bloqué le : <b className="text-foreground">{user.blockedAt ? new Date(user.blockedAt).toLocaleString() : "—"}</b></div>
                <div className="sm:col-span-2">Motif : <b className="text-foreground">{user.blockedReason ?? "—"}</b></div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Envoyer une alerte</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sujet</Label>
              <Input value={alertForm.subject} onChange={(e) => setAlertForm({ ...alertForm, subject: e.target.value })} />
              {alertErrors.subject && <p className="mt-1 text-xs text-destructive">{alertErrors.subject}</p>}
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={4} value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} />
              {alertErrors.message && <p className="mt-1 text-xs text-destructive">{alertErrors.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertOpen(false)}>Annuler</Button>
            <Button onClick={submitAlert} disabled={alertMutation.isPending}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bloquer {user.fullname}</DialogTitle></DialogHeader>
          <div>
            <Label>Motif du blocage</Label>
            <Textarea rows={3} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
            {blockError && <p className="mt-1 text-xs text-destructive">{blockError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>Bloquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
