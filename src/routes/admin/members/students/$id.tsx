import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertTriangle, Ban, ShieldCheck, Mail, Calendar, Phone, Briefcase, MapPin, Info, Cake, } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, } from "@/components/ui/dialog";
import { useAdminStudentDetail, useAlertAdminStudent, useBlockAdminStudent, useReactivateAdminStudent, } from "@/stores/useStudentsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/students/$id")({
  head: () => ({
    meta: [{ title: `Apprenant | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: StudentDetail,
});

function getInitials(name: string): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du profil...
        </div>
      </AdminShell>
    );
  }

  if (!student) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/students" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la liste
          </Button>
        </div>
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          <p>Apprenant introuvable.</p>
        </div>
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
          toast.success("Alerte envoyée avec succès");
          setAlertOpen(false);
          setAlertForm({ subject: "", message: "" });
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'alerte"),
      }
    );
  };

  const submitBlock = () => {
    if (!blockReason.trim()) {
      setBlockError("Le motif du blocage est obligatoire");
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
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/members/students" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setAlertOpen(true)}>
            <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'apprenant
          </Button>
          {student.isBlocked ? (
            <Button size="sm" onClick={handleReactivate} disabled={reactivateMutation.isPending}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Réactiver le compte
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setBlockOpen(true)}
            >
              <Ban className="mr-1.5 h-4 w-4" /> Bloquer l'accès
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Banner de blocage si actif */}
        {student.isBlocked && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">Ce compte apprenant est actuellement bloqué.</p>
              <p className="mt-0.5 text-xs text-destructive/80">
                Bloqué le {student.blockedAt ? new Date(student.blockedAt).toLocaleString() : "—"}.
                {student.blockedReason && ` Motif : "${student.blockedReason}"`}
              </p>
            </div>
          </div>
        )}

        {/* Profil Header & Body Card */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Header Visuel */}
          <div className="border-b bg-muted/40 p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display text-xl font-bold">
                  {getInitials(student.fullname)}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">{student.fullname}</h1>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{student.email}</span>
                  </div>
                </div>
              </div>

              {/* Badges statut */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${student.isBlocked
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : student.isActive
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${student.isBlocked ? "bg-rose-500" : student.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  {student.isBlocked ? "Bloqué" : student.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Téléphone</div>
                  <div className="text-sm font-semibold mt-0.5">{student.phone || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Cake className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Date de naissance</div>
                  <div className="text-sm font-semibold mt-0.5">
                    {student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Profession</div>
                  <div className="text-sm font-semibold mt-0.5">{student.occupation || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Adresse</div>
                  <div className="text-sm font-semibold mt-0.5">{student.address || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4 bg-background/50 sm:col-span-2">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Inscrit le</div>
                  <div className="text-sm font-semibold mt-0.5">
                    {new Date(student.createdAt).toLocaleDateString("fr-FR")} à {new Date(student.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {student.bio && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <Info className="h-3.5 w-3.5" /> Biographie
                </div>
                <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
                  {student.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Alerte */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avertir l'apprenant</DialogTitle>
            <DialogDescription>
              Envoie une notification d'avertissement directement à l'apprenant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Sujet de l'avertissement</Label>
              <Input
                placeholder="Ex: Non-respect du règlement des cours"
                value={alertForm.subject}
                onChange={(e) => setAlertForm({ ...alertForm, subject: e.target.value })}
              />
              {alertErrors.subject && <p className="mt-1 text-xs text-destructive">{alertErrors.subject}</p>}
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                rows={4}
                placeholder="Explication détaillée..."
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
              />
              {alertErrors.message && <p className="mt-1 text-xs text-destructive">{alertErrors.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertOpen(false)}>Annuler</Button>
            <Button onClick={submitAlert} disabled={alertMutation.isPending}>
              {alertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'avertissement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Blocage */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Bloquer {student.fullname}</DialogTitle>
            <DialogDescription>
              Cette action restreindra immédiatement l'accès de l'apprenant à ses parcours et espaces.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Motif explicite du blocage</Label>
              <Textarea
                rows={3}
                placeholder="Renseignez le motif qui justifie la suspension du compte..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              {blockError && <p className="mt-1 text-xs text-destructive">{blockError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={submitBlock} disabled={blockMutation.isPending}>
              {blockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le blocage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
