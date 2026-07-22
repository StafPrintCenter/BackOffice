import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminContactDetail, useUpdateAdminContactStatus } from "@/stores/useContactsStore";
import type { ContactStatus } from "@/data/contact";

export const Route = createFileRoute("/admin/messages/$id")({
  head: () => ({ meta: [{ title: "Message — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MessageDetail,
});

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
          toast.success("Statut mis à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour du statut"),
      }
    );
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/messages" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !msg ? (
        <p className="text-muted-foreground">Message introuvable.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-mono text-xs text-muted-foreground">{msg.ticketNumber}</div>
              <h1 className="font-display text-2xl font-bold mt-1">{msg.name}</h1>
              <div className="text-sm text-muted-foreground">{msg.email}</div>
              <div className="mt-4 text-xs text-muted-foreground">
                Service demandé : <b className="text-foreground">{msg.customService || msg.service}</b>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Reçu le : <b className="text-foreground">{new Date(msg.createdAt).toLocaleString()}</b>
              </div>
              {msg.handledBy && (
                <div className="mt-1 text-xs text-muted-foreground">
                  Traité par : <b className="text-foreground">{msg.handledBy}</b>
                  {msg.handledAt && ` le ${new Date(msg.handledAt).toLocaleString()}`}
                </div>
              )}
              <div className="mt-4 rounded-lg bg-muted/50 p-4 whitespace-pre-wrap text-sm">{msg.message}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div>
                <Label>Statut</Label>
                {isEditing ? (
                  <Select value={status} onValueChange={(v) => setStatus(v as ContactStatus)}>
                    <SelectTrigger>
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
                  <div className="mt-1 text-sm font-medium">{statusLabel(msg.status)}</div>
                )}
              </div>
              <div>
                <Label>Notes admin</Label>
                {isEditing ? (
                  <Textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
                ) : (
                  <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {msg.adminNotes || "—"}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleSave} disabled={updateStatus.isPending}>
                    {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleCancel}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setIsEditing(true)}>
                  Modifier le statut
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}