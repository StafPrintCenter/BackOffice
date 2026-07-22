import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Tag, Calendar, UserCheck, Clock, Pencil, Save, X, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminReportDetail, useUpdateAdminReportStatus } from "@/stores/useReportsStore";
import {
  REPORT_STATUS_BADGES,
  REPORT_STATUS_LABELS,
  getReportReasonLabel,
  getReportableTypeLabel,
  type ReportStatus,
} from "@/data/reports";

export const Route = createFileRoute("/admin/reports/$id")({
  head: () => ({ meta: [{ title: "Signalement — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ReportDetail,
});

function ReportDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: rep, isLoading } = useAdminReportDetail(id);
  const updateStatus = useUpdateAdminReportStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<ReportStatus>("pending");

  useEffect(() => {
    if (rep) setStatus(rep.status);
  }, [rep]);

  const handleCancel = () => {
    if (rep) setStatus(rep.status);
    setIsEditing(false);
  };

  const handleSave = () => {
    updateStatus.mutate(
      { id, payload: { status } },
      {
        onSuccess: () => {
          toast.success("Statut mis à jour");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la mise à jour"),
      }
    );
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium", timeStyle: "short",
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reports" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !rep ? (
        <p className="text-muted-foreground">Signalement introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          {/* En-tête principal */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2.5 py-1 font-mono text-xs font-semibold">
                  #{rep.id}
                </code>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[rep.status]}`}>
                  {REPORT_STATUS_LABELS[rep.status]}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold mt-2">
                {getReportReasonLabel(rep.reason)}
              </h1>
              {rep.reporterEmail && (
                <a href={`mailto:${rep.reporterEmail}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" /> {rep.reporterEmail}
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center gap-2 font-display text-lg font-semibold border-b pb-3">
                  <MessageSquare className="h-5 w-5 text-primary" /> Détails du signalement
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-2 text-muted-foreground bg-muted/30 p-3 rounded-xl border">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>
                      Cible : <b className="text-foreground">{getReportableTypeLabel(rep.reportableType)}</b>{" "}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Reçu le : <b className="text-foreground">{formatDate(rep.createdAt)}</b></span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap border">
                  {rep.message || "Aucun message complémentaire fourni."}
                </div>
              </div>

              {/* Résolution */}
              {(rep.resolvedBy || rep.resolvedAt) && (
                <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-3">
                  {rep.resolvedBy && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>Résolu par : <b className="text-foreground">{rep.resolvedBy}</b></span>
                    </div>
                  )}
                  {rep.resolvedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Le : <b className="text-foreground">{formatDate(rep.resolvedAt)}</b></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panneau latéral : Gestion du statut */}
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-display font-semibold">Suivi du signalement</span>
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
                      <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Ouvert</SelectItem>
                          <SelectItem value="in_review">En cours</SelectItem>
                          <SelectItem value="resolved">Résolu</SelectItem>
                          <SelectItem value="dismissed">Rejeté</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[rep.status]}`}>
                          {REPORT_STATUS_LABELS[rep.status]}
                        </span>
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
