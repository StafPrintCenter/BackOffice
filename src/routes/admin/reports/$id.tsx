import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportsApi } from "@/api/extra.api";
import type { Report, ReportStatus } from "@/types";

export const Route = createFileRoute("/admin/reports/$id")({
  head: () => ({ meta: [{ title: "Signalement — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ReportDetail,
});

function ReportDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["reports"], queryFn: reportsApi.list });
  const rep = data?.find((r) => r.id === id);
  const [status, setStatus] = useState<ReportStatus>("ouvert");
  useEffect(() => { if (rep) setStatus(rep.status); }, [rep]);

  const update = useMutation({
    mutationFn: (v: Partial<Report>) => reportsApi.update(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reports"] }); toast.success("Signalement mis à jour"); },
  });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reports" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button>
      </div>
      {!rep ? <p className="text-muted-foreground">Signalement introuvable.</p> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border bg-card p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Signalement</div>
              <h1 className="font-display text-2xl font-bold mt-1">{rep.reason}</h1>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">Cible : </span><b>{rep.reportableType} #{rep.reportableId}</b></div>
                <div><span className="text-muted-foreground">Signalé par : </span><b>{rep.reporterEmail}</b></div>
                <div><span className="text-muted-foreground">Reçu le : </span><b>{new Date(rep.createdAt).toLocaleString()}</b></div>
                {rep.resolvedAt && <div><span className="text-muted-foreground">Résolu le : </span><b>{new Date(rep.resolvedAt).toLocaleString()}</b></div>}
              </div>
              <div className="mt-4 rounded-lg bg-muted/50 p-4 whitespace-pre-wrap text-sm">{rep.message}</div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <div>
              <Label>Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ouvert">Ouvert</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => update.mutate({ status, resolvedBy: "admin@stafprint.com", resolvedAt: new Date().toISOString() })}>Enregistrer</Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
