import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/site/DataTable";
import { reportsApi } from "@/api/extra.api";
import type { Report, ReportStatus } from "@/types";

export const Route = createFileRoute("/admin/reports/")({
  head: () => ({ meta: [{ title: "Signalements — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminReports,
});

const badge = (s: ReportStatus) => ({
  ouvert: "bg-red-100 text-red-700",
  en_cours: "bg-amber-100 text-amber-700",
  resolu: "bg-emerald-100 text-emerald-700",
  rejete: "bg-muted text-muted-foreground",
}[s]);
const label = (s: ReportStatus) => ({ ouvert: "Ouvert", en_cours: "En cours", resolu: "Résolu", rejete: "Rejeté" }[s]);

function AdminReports() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: reportsApi.list });
  const [toDelete, setToDelete] = useState<Report | null>(null);
  const remove = useMutation({ mutationFn: (id: string) => reportsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["reports"] }); toast.success("Supprimé"); setToDelete(null); } });

  return (
    <AdminShell>
      <PageHeader title="Signalements" description="Contenus signalés par les visiteurs." />
      <DataTable<Report>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["reason", "reportableType", "reporterEmail"]}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "id", label: "ID", render: (r) => <Link to="/admin/reports/$id" params={{ id: r.id }} className="font-mono text-xs text-primary hover:underline">#{r.id.slice(0, 6)}</Link> },
          { key: "reportableType", label: "Type", render: (r) => <div><div className="font-medium text-xs">{r.reportableType}</div><div className="text-[10px] text-muted-foreground">{r.reportableId}</div></div> },
          { key: "reason", label: "Motif", render: (r) => <div className="max-w-xs line-clamp-2">{r.reason}</div> },
          { key: "reporterEmail", label: "Signalé par", render: (r) => <span className="text-xs">{r.reporterEmail}</span> },
          { key: "status", label: "Statut", render: (r) => <span className={"rounded-full px-2 py-0.5 text-xs " + badge(r.status)}>{label(r.status)}</span> },
        ]}
      />
      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title="Supprimer ce signalement ?" />
    </AdminShell>
  );
}
