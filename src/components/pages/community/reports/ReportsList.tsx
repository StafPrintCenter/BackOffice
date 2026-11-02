import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Pager } from "@/components/pages/trainings/sessions/Pager";
import { useReportsList } from "@/stores/useCommunityAdminStore";
import { DEFAULT_REPORT_FILTERS, ReportsFilters, type ReportsFiltersValue } from "./ReportsFilters";
import { ReportCard } from "./ReportCard";

export function ReportsList() {
  const [filters, setFilters] = useState<ReportsFiltersValue>(DEFAULT_REPORT_FILTERS);
  const [page, setPage] = useState(1);
  const { reports, stats, meta, isLoading, isError } = useReportsList({ ...filters, page, perPage: 12 });

  return (
    <>
      {stats && (
        <p className="mb-3 text-xs text-muted-foreground">
          {stats.pending} en attente · {stats.resolved} traité(s) · {stats.dismissed} rejeté(s)
        </p>
      )}
      <ReportsFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les signalements.</p>
      ) : reports.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Aucun signalement ne correspond.</p>
      ) : (
        <div className="max-w-3xl space-y-4">{reports.map((r) => <ReportCard key={r.id} report={r} />)}</div>
      )}
      {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} total={meta.total} onChange={setPage} />}
    </>
  );
}
