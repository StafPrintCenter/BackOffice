import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { messagesApi } from "@/api/extra.api";
import type { Message, MessageStatus } from "@/types";

export const Route = createFileRoute("/admin/messages/admin/messages/$id")({
  head: () => ({ meta: [{ title: "Message — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MessageDetail,
});

function MessageDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["messages"], queryFn: messagesApi.list });
  const msg = data?.find((m) => m.id === id);
  const [status, setStatus] = useState<MessageStatus>("nouveau");
  const [notes, setNotes] = useState("");

  useEffect(() => { if (msg) { setStatus(msg.status); setNotes(msg.adminNotes ?? ""); } }, [msg]);

  const update = useMutation({
    mutationFn: (v: Partial<Message>) => messagesApi.update(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["messages"] }); toast.success("Message mis à jour"); },
  });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/messages" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
      </div>
      {!msg ? <p className="text-muted-foreground">Message introuvable.</p> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-mono text-xs text-muted-foreground">{msg.ticketNumber}</div>
              <h1 className="font-display text-2xl font-bold mt-1">{msg.name}</h1>
              <div className="text-sm text-muted-foreground">{msg.email}</div>
              <div className="mt-4 text-xs text-muted-foreground">Service demandé : <b className="text-foreground">{msg.customService || msg.service}</b></div>
              <div className="mt-1 text-xs text-muted-foreground">Reçu le : <b className="text-foreground">{new Date(msg.createdAt).toLocaleString()}</b></div>
              <div className="mt-4 rounded-lg bg-muted/50 p-4 whitespace-pre-wrap text-sm">{msg.message}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <div>
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as MessageStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nouveau">Nouveau</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="traite">Traité</SelectItem>
                    <SelectItem value="archive">Archivé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes admin</Label>
                <Textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => update.mutate({ status, adminNotes: notes, handledBy: "admin@stafprint.com", handledAt: new Date().toISOString() })}>
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
