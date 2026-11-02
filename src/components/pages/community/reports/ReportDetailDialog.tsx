import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPostDate } from "@/data/community";
import { RESOLUTION_LABELS } from "@/data/communityAdmin";
import { useReportDetail } from "@/stores/useCommunityAdminStore";
import { EscalatedBadge, ReportLevelBadge, ReportReasonBadge, ReportStatusBadge, TargetTypeBadge } from "./ReportBadges";
import { ReportTarget } from "./ReportTarget";
import { ResolveReportDialog } from "./ResolveReportDialog";

interface Props { reportId: string | undefined; onClose: () => void }

export function ReportDetailDialog({ reportId, onClose }: Props) {
  const { report: r, isLoading } = useReportDetail(reportId);
  const [resolveOpen, setResolveOpen] = useState(false);

  return (
    <Dialog open={!!reportId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Détail du signalement</DialogTitle></DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
        ) : !r ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Signalement introuvable.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <ReportStatusBadge status={r.status} /><ReportReasonBadge reason={r.reason} />
              <TargetTypeBadge type={r.target.type} /><ReportLevelBadge level={r.level} />
              {r.escalation != null && <EscalatedBadge />}
            </div>
            <p className="text-xs text-muted-foreground">
              Signalé le {formatPostDate(r.reportedAt)}{r.reporter && <> par <b className="text-foreground">{r.reporter.name}</b></>}
              {typeof r.reportsOnTarget === "number" && <> · <b className="text-foreground">{r.reportsOnTarget}</b> signalement(s) sur ce contenu</>}
            </p>
            {r.details && <p className="rounded-md border-l-2 bg-muted/30 px-3 py-1.5 text-sm italic">« {r.details} »</p>}

            <ReportTarget target={r.target} full />

            {r.resolution && (
              <p className="rounded-md bg-emerald-500/5 px-3 py-2 text-xs">
                <b>{RESOLUTION_LABELS[r.resolution.action] ?? r.resolution.action}</b>
                {r.resolution.by && <> par {r.resolution.by.name}</>} · {formatPostDate(r.resolution.at)}
                {r.resolution.note && <span className="block text-muted-foreground">Note : {r.resolution.note}</span>}
              </p>
            )}

            {r.status === "pending" && (
              <>
                <Button onClick={() => setResolveOpen(true)}>Traiter ce signalement</Button>
                <ResolveReportDialog report={r} open={resolveOpen} onOpenChange={setResolveOpen} />
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}