import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail, MessageCircle, Calendar, Clock, User, CheckCircle2, XCircle, Ban, CheckCheck } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appointmentsApi } from "@/api/appointments.api";
import { useAuth } from "@/hooks/useAuth";
import type { Appointment, AppointmentStatus } from "@/types";
import { modeLabel, modeIcon, statusLabel, statusBadge } from "./admin.appointments.index";

export const Route = createFileRoute("/admin/appointments/$id")({
  head: () => ({ meta: [{ title: "Rendez-vous — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["appointments"], queryFn: appointmentsApi.list });
  const a = data?.find((x) => x.id === id);

  const [notes, setNotes] = useState("");
  useEffect(() => { setNotes(a?.adminNotes ?? ""); }, [a?.id, a?.adminNotes]);

  const update = useMutation({
    mutationFn: (patch: Partial<Appointment>) => appointmentsApi.update(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Rendez-vous mis à jour"); },
  });

  if (!a) {
    return (
      <AdminShell>
        <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/appointments" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
        <p className="text-muted-foreground">Rendez-vous introuvable.</p>
      </AdminShell>
    );
  }

  const Icon = modeIcon(a.mode);
  const d = new Date(a.scheduledAt);
  const setStatus = (status: AppointmentStatus) => update.mutate({ status, handledBy: user?.email, handledAt: new Date().toISOString() });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/appointments" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
        <span className={"rounded-full px-3 py-1 text-xs font-medium " + statusBadge(a.status)}>{statusLabel(a.status)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {modeLabel(a.mode)} · {a.duration} min
                </div>
                <h1 className="mt-2 font-display text-2xl font-bold">{a.subject}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{d.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-3">Message</div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{a.message}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <Label htmlFor="notes" className="font-semibold">Notes administratives</Label>
            <Textarea id="notes" className="mt-2" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ajoutez des notes internes..." />
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={() => update.mutate({ adminNotes: notes })} disabled={update.isPending}>Enregistrer les notes</Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-4">Contact</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span>{a.firstName} {a.lastName}</span></div>
              <a className="flex items-center gap-2 hover:text-primary" href={`mailto:${a.email}`}><Mail className="h-4 w-4 text-muted-foreground" />{a.email}</a>
              <a className="flex items-center gap-2 hover:text-primary" href={`https://wa.me/${a.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-muted-foreground" />{a.whatsapp}</a>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-4">Statut</div>
            <Select value={a.status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
                <SelectItem value="termine">Terminé</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => setStatus("confirme")}><CheckCircle2 className="h-4 w-4 mr-1" />Confirmer</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("refuse")}><XCircle className="h-4 w-4 mr-1" />Refuser</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("annule")}><Ban className="h-4 w-4 mr-1" />Annuler</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("termine")}><CheckCheck className="h-4 w-4 mr-1" />Terminé</Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 text-xs text-muted-foreground space-y-1.5">
            <div>Créé le {new Date(a.createdAt).toLocaleString("fr-FR")}</div>
            <div>CGU acceptées : {a.acceptedTerms ? "Oui" : "Non"}</div>
            {a.handledBy && <div>Traité par {a.handledBy}</div>}
            {a.handledAt && <div>Le {new Date(a.handledAt).toLocaleString("fr-FR")}</div>}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
