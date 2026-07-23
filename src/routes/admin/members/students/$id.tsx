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
  useAdminStudentDetail,
  useAlertAdminStudent,
  useBlockAdminStudent,
  useReactivateAdminStudent,
} from "@/stores/useStudentsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/students/$id")({
  head: () => ({
    meta: [{ title: `Apprenant | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: StudentDetail,
});

function StudentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: student, isLoading } = useAdminStudentDetail(id);

  const alertMutation = useAlertAdminStudent();
  const blockMutation = useBlockAdminStudent();
  const reactivateMutation = useReactivateAdminStudent();

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

  if (!student) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/students" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Apprenant introuvable.</p>
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
      { id: student.id, subject: alertForm.subject, message: alertForm.message },
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
      { id: student.id, reason: blockReason },
      {
        onSuccess: () => {
          toast.success("Apprenant bloqué");
          setBlockOpen(false);
          setBlockReason("");
        },
        onError: () => toast.error("Erreur lors du blocage"),
      }
    );
  };

  const handleReactivate = () => {
    reactivateMutation.mutate(student.id, {
      onSuccess: () => toast.success("Apprenant réactivé"),
      onError: () => toast.error("Erreur lors de la réactivation"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/students" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <AlertTriangle className="mr-1 h-4 w-4" /> Alerter
          </Button>
          {student.isBlocked ? (
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
            <h1 className="font-display text-2xl font-bold">{student.fullname}</h1>
            <span
              className={
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                (student.isBlocked
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : student.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-muted text-muted-foreground border-border")
              }
            >
              {student.isBlocked ? "Bloqué" : student.isActive ? "Actif" : "Inactif"}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">{student.email}</div>

          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <div>Téléphone : <b className="text-foreground">{student.phone || "—"}</b></div>
            <div>Date de naissance : <b className="text-foreground">{student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "—"}</b></div>
            <div>Profession : <b className="text-foreground">{student.occupation || "—"}</b></div>
            <div>Adresse : <b className="text-foreground">{student.address || "—"}</b></div>
            <div>Inscrit le : <b className="text-foreground">{new Date(student.createdAt).toLocaleString()}</b></div>
            {student.bio && <div className="sm:col-span-2">Bio : <span className="text-foreground">{student.bio}</span></div>}
            {student.isBlocked && (
              <>
                <div>Bloqué le : <b className="text-foreground">{student.blockedAt ? new Date(student.blockedAt).toLocaleString() : "—"}</b></div>
                <div className="sm:col-span-2">Motif : <b className="text-foreground">{student.blockedReason ?? "—"}</b></div>
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
          <DialogHeader><DialogTitle>Bloquer {student.fullname}</DialogTitle></DialogHeader>
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