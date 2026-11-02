import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CircleCheck, Gavel, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthorRoleBadge } from "@/components/pages/community/shared";
import { formatPostDate } from "@/data/community";
import { RESOLUTION_LABELS, type APIReport } from "@/data/communityAdmin";
import { EscalatedBadge, ReportLevelBadge, ReportReasonBadge, ReportStatusBadge, TargetTypeBadge } from "./ReportBadges";
import { ReportTarget } from "./ReportTarget";
import { ResolveReportDialog } from "./ResolveReportDialog";

export function ReportCard({ report: r }: { report: APIReport }) {
  const [resolveOpen, setResolveOpen] = useState(false);

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <ReportStatusBadge status={r.status} /><ReportReasonBadge reason={r.reason} />
          <TargetTypeBadge type={r.target.type} /><ReportLevelBadge level={r.level} />
          {r.escalation != null && <EscalatedBadge />}
        </div>
        <span className="text-xs text-muted-foreground">{formatPostDate(r.reportedAt)}</span>
      </div>

      {r.reporter && (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          Signalé par <b className="font-medium text-foreground">{r.reporter.name}</b> <AuthorRoleBadge role={r.reporter.role} />
        </p>
      )}
      {r.details && <p className="rounded-md border-l-2 bg-muted/30 px-3 py-1.5 text-sm italic">« {r.details} »</p>}

      <ReportTarget target={r.target} />

      {r.resolution && (
        <div className="flex items-start gap-2 rounded-md bg-emerald-500/5 px-3 py-2 text-xs">
          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <b>{RESOLUTION_LABELS[r.resolution.action] ?? r.resolution.action}</b>
            {r.resolution.by && <> par {r.resolution.by.name}</>} · {formatPostDate(r.resolution.at)}
            {r.resolution.note && <p className="mt-0.5 text-muted-foreground">Note : {r.resolution.note}</p>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <Button asChild size="sm" variant="outline">
          <Link to="/community/reports/$id" params={{ id: r.id }}><Info className="mr-1 h-3.5 w-3.5" /> Détails</Link>
        </Button>
        {r.status === "pending" && (
          <Button size="sm" onClick={() => setResolveOpen(true)}><Gavel className="mr-1 h-3.5 w-3.5" /> Traiter</Button>
        )}
      </div>

      {r.status === "pending" && <ResolveReportDialog report={r} open={resolveOpen} onOpenChange={setResolveOpen} />}
    </article>
  );
}
