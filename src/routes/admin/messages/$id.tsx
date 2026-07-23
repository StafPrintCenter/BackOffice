import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Tag, Calendar, UserCheck, Clock, Pencil, Save, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminContactDetail, useUpdateAdminContactStatus } from "@/stores/useContactsStore";
import type { ContactStatus } from "@/data/contact";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/messages/$id")({
  head: () => ({
    meta: [
      { title: `Messages | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: MessageDetail,
});

const statusBadge = (s: ContactStatus) =>
({
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-muted text-muted-foreground border-border",
}[s]);

const statusLabel = (s: ContactStatus) =>
  ({ new: "Nouveau", in_progress: "En cours", resolved: "Résolu", closed: "Fermé" }[s]);

function MessageDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: msg, isLoading } = useAdminContactDetail(id);
  const updateStatus = useUpdateAdminContactStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<ContactStatus>("new");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (msg) {
      setStatus(msg.status);
      setNotes(msg.adminNotes ?? "");
    }
  }, [msg]);

  const handleCancel = () => {
    if (msg) {
      setStatus(msg.status);
      setNotes(msg.adminNotes ?? "");
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    updateStatus.mutate(
      { id, payload: { status, admin_notes: notes } },
      {
        onSuccess: () => {
          toast.success("Statut et notes mis à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/messages" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !msg ? (
        <p className="text-muted-foreground">Message introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2.5 py-1 font-mono text-xs font-semibold">{msg.ticketNumber}</code>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(msg.status)}`}>
                  {statusLabel(msg.status)}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold mt-2">{msg.name}</h1>
              <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" /> {msg.email}
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contenu principal du message */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 font-display text-lg font-semibold border-b pb-3">
                  <MessageSquare className="h-5 w-5 text-primary" /> Contenu du message
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-2 text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>Service : <b className="text-foreground">{msg.customService || msg.service}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Reçu le : <b className="text-foreground">{formatDate(msg.createdAt)}</b></span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap border">
                  {msg.message}
                </div>
              </div>

              {/* Traitement Admin */}
              {(msg.handledBy || msg.handledAt) && (
                <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {msg.handledBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Traité par : <b className="text-foreground">{msg.handledBy}</b></span>
                    </div>
                  )}
                  {msg.handledAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Le : <b className="text-foreground">{formatDate(msg.handledAt)}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Gestion du statut et Notes */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi du ticket</span>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Statut actuel</Label>
                    {isEditing ? (
                      <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nouveau</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="resolved">Résolu</SelectItem>
                          <SelectItem value="closed">Fermé</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(msg.status)}`}>
                          {statusLabel(msg.status)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Notes internes admin</Label>
                    {isEditing ? (
                      <Textarea
                        rows={6}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajouter des notes privées sur le traitement..."
                        className="mt-1 text-xs"
                      />
                    ) : (
                      <div className="mt-1 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap border">
                        {msg.adminNotes || "Aucune note enregistrée."}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                        {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" /> Enregistrer</>}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" /> Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
