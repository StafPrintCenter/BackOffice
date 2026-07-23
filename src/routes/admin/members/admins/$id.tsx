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
  useAdminAdminDetail,
  useAlertAdminAdmin,
  useBlockAdminAdmin,
  useReactivateAdminAdmin,
} from "@/stores/useAdminsStore";
import { ADMIN_LEVEL_BADGES, ADMIN_LEVEL_LABELS } from "@/data/admins";
import { SITE } from "@/data/site";
// ⚠️ À adapter : remplacez par le vrai hook d'authentification du projet.
import { useCurrentAdmin } from "@/stores/useAuthStore";

export const Route = createFileRoute("/admin/members/admins/$id")({
  head: () => ({
    meta: [{ title: `Administrateur | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDetail,
});

function AdminDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: admin, isLoading } = useAdminAdminDetail(id);
  const { admin: currentAdmin } = useCurrentAdmin();

  const alertMutation = useAlertAdminAdmin();
  const blockMutation = useBlockAdminAdmin();
  const reactivateMutation = useReactivateAdminAdmin();

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

  if (!admin) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/admins" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Administrateur introuvable.</p>
      </AdminShell>
    );
  }

  const isSelf = currentAdmin?.id === admin.id;

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
      { id: admin.id, subject: alertForm.subject, message: alertForm.message },
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
      { id: admin.id, reason: blockReason },
      {
        onSuccess: () => {
          toast.success("Administrateur bloqué");
          setBlockOpen(false);
          setBlockReason("");
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(admin.id, {
      onSuccess: () => toast.success("Administrateur réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/admins" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        {!isSelf && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
              <AlertTriangle className="mr-1 h-4 w-4" /> Alerter
            </Button>
            {admin.isBlocked ? (
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
        )}
      </div>

      <div className="max-w-2xl space-y-6">
        {isSelf && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-700">
            C'est votre propre compte : vous ne pouvez pas vous alerter ni vous bloquer vous-même.
          </div>
        )}

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-display text-2xl font-bold">{admin.fullname}</h1>
            <div className="flex gap-2">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ADMIN_LEVEL_BADGES[admin.level] ?? "bg-muted text-muted-foreground"}`}>
                {ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
              </span>
              <span
                className={
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                  (admin.isPending
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : admin.isBlocked
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      : admin.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border")
                }
              >
                {admin.isPending ? "Invitation en attente" : admin.isBlocked ? "Bloqué" : admin.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">{admin.email}</div>

          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            {admin.invitedBy && <div>Invité par : <b className="text-foreground">{admin.invitedBy}</b></div>}
            {admin.invitedAt && <div>Invité le : <b className="text-foreground">{new Date(admin.invitedAt).toLocaleString()}</b></div>}
            {admin.acceptedAt && <div>Invitation acceptée le : <b className="text-foreground">{new Date(admin.acceptedAt).toLocaleString()}</b></div>}
            <div>Ajouté le : <b className="text-foreground">{new Date(admin.createdAt).toLocaleString()}</b></div>
            {admin.bio && <div className="sm:col-span-2">Bio : <span className="text-foreground">{admin.bio}</span></div>}
            {admin.isBlocked && (
              <>
                <div>Bloqué le : <b className="text-foreground">{admin.blockedAt ? new Date(admin.blockedAt).toLocaleString() : "—"}</b></div>
                <div className="sm:col-span-2">Motif : <b className="text-foreground">{admin.blockedReason ?? "—"}</b></div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isSelf && (
        <>
          <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Envoyer une alerte</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Sujet</Label>
                  <Input value={alertForm.subject} onChange={(e) => setAlertForm({ ...alertForm, subject: e.target.value })} />
                  {alertErrors.subject && <p className="text-xs text-destructive mt-1">{alertErrors.subject}</p>}
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea rows={4} value={alertForm.message} onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })} />
                  {alertErrors.message && <p className="text-xs text-destructive mt-1">{alertErrors.message}</p>}
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
              <DialogHeader><DialogTitle>Bloquer {admin.fullname}</DialogTitle></DialogHeader>
              <div>
                <Label>Motif du blocage</Label>
                <Textarea rows={3} value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                {blockError && <p className="text-xs text-destructive mt-1">{blockError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBlockOpen(false)}>Annuler</Button>
                <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>Bloquer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AdminShell>
  );
}