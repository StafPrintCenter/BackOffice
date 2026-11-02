import { REPORT_REASON_LABELS, type ReportReason } from "@/data/community";
import {
  REPORT_LEVEL_LABELS, REPORT_STATUS_LABELS, TARGET_TYPE_LABELS,
  type ReportLevel, type ReportStatus, type ReportTargetType,
} from "@/data/communityAdmin";

const base = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold";
const neutral = "border-border bg-muted/50 text-muted-foreground";

const STATUS: Record<ReportStatus, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  resolved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  dismissed: neutral,
};

export const ReportStatusBadge = ({ status }: { status: ReportStatus }) => (
  <span className={`${base} ${STATUS[status] ?? neutral}`}>{REPORT_STATUS_LABELS[status] ?? status}</span>
);
export const ReportLevelBadge = ({ level }: { level: ReportLevel }) => (
  <span className={`${base} ${neutral}`}>Niveau : {REPORT_LEVEL_LABELS[level] ?? level}</span>
);
export const ReportReasonBadge = ({ reason }: { reason: string }) => (
  <span className={`${base} border-rose-500/20 bg-rose-500/10 text-rose-600`}>{REPORT_REASON_LABELS[reason as ReportReason] ?? reason}</span>
);
export const TargetTypeBadge = ({ type }: { type: ReportTargetType }) => (
  <span className={`${base} ${neutral}`}>{TARGET_TYPE_LABELS[type] ?? type}</span>
);
export const EscalatedBadge = () => (
  <span className={`${base} border-violet-500/20 bg-violet-500/10 text-violet-600`}>Escaladé</span>
);