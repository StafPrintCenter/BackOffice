import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REPORT_STATUS_BADGES,
  REPORT_STATUS_LABELS,
  type ReportStatus,
} from "@/data/reports";
import { SITE } from "@/data/site";
import {
  useAdminEthicalReportDetail,
  useUpdateAdminEthicalReportStatus,
} from "@/stores/useEthicalReportsStore";

export const Route = createFileRoute("/_admin/reports/ethical/$id")({
  head: () => ({
    meta: [
      { title: `Signalement éthique | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EthicalReportDetail,
});

function EthicalReportDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: report, isLoading, isError } = useAdminEthicalReportDetail(id);
  const updateStatus = useUpdateAdminEthicalReportStatus();
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<ReportStatus>("pending");

  useEffect(() => {
    if (report) setStatus(report.status);
  }, [report]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleCancel = () => {
    if (report) setStatus(report.status);
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
        onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la mise à jour du statut")),
      }
    );
  };

  return (
    <>
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/reports/ethical" })}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux signalements
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
        </div>
      ) : isError ? (
        <p className="text-destructive">Erreur lors du chargement du signalement.</p>
      ) : !report ? (
        <p className="text-muted-foreground">Signalement introuvable.</p>
      ) : (
        <div className="max-w-5xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-muted px-2.5 py-1 font-mono text-xs font-semibold">
                  {report.trackingCode}
                </code>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[report.status]}`}
                >
                  {REPORT_STATUS_LABELS[report.status]}
                </span>
                {report.anonymous && (
                  <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                    Anonyme
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold">{report.category}</h1>
              {!report.anonymous && report.contact && (
                <a
                  href={`mailto:${report.contact}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" /> {report.contact}
                </a>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="space-y-4 rounded-2xl border bg-card p-6">
                <h2 className="flex items-center gap-2 border-b pb-3 font-display text-lg font-semibold">
                  <FileText className="h-5 w-5 text-primary" /> Détails du signalement
                </h2>
                <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-primary" />
                    <span>
                      Personne concernée :{" "}
                      <b className="text-foreground">{report.concerned || "-"}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Période des faits :{" "}
                      <b className="text-foreground">{report.occurrencePeriod || "-"}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Reçu le : <b className="text-foreground">{formatDate(report.createdAt)}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>
                      Déclaration de bonne foi :{" "}
                      <b className="text-foreground">{report.goodFaith ? "Oui" : "Non"}</b>
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Description</h3>
                  <div className="whitespace-pre-wrap rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                    {report.description || "Aucune description fournie."}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Éléments de preuve</h3>
                  <div className="whitespace-pre-wrap wrap-break-word rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                    {report.evidence || "Aucun élément de preuve fourni."}
                  </div>
                </div>
              </section>

              {(report.resolvedBy || report.resolvedAt) && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
                  {report.resolvedBy && (
                    <span>
                      Traité par : <b className="text-foreground">{report.resolvedBy}</b>
                    </span>
                  )}
                  {report.resolvedAt && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary" />
                      Le : <b className="text-foreground">{formatDate(report.resolvedAt)}</b>
                    </span>
                  )}
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <section className="space-y-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="font-display font-semibold">Suivi du signalement</h2>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="mr-1 h-4 w-4" /> Modifier
                    </Button>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  {isEditing ? (
                    <Select
                      value={status}
                      onValueChange={(value) => setStatus(value as ReportStatus)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="in_review">En cours</SelectItem>
                        <SelectItem value="resolved">Résolu</SelectItem>
                        <SelectItem value="dismissed">Rejeté</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[report.status]}`}
                      >
                        {REPORT_STATUS_LABELS[report.status]}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleSave}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-1 h-4 w-4" /> Enregistrer
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleCancel}
                      disabled={updateStatus.isPending}
                    >
                      <X className="mr-1 h-4 w-4" /> Annuler
                    </Button>
                  </div>
                )}
              </section>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
