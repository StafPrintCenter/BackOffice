import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_REASONS, REPORT_REASON_LABELS } from "@/data/community";
import {
  REPORT_LEVEL_LABELS, REPORT_STATUS_LABELS, TARGET_TYPE_LABELS,
  type ReportLevel, type ReportStatus, type ReportTargetType,
} from "@/data/communityAdmin";

export type ReportsFiltersValue = { status: ReportStatus | ""; level: ReportLevel | ""; reason: string; targetType: ReportTargetType | "" };
export const DEFAULT_REPORT_FILTERS: ReportsFiltersValue = { status: "pending", level: "", reason: "", targetType: "" };

const select = "h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-sm";

export function ReportsFilters({ value, onChange }: { value: ReportsFiltersValue; onChange: (v: ReportsFiltersValue) => void }) {
  const changed = JSON.stringify(value) !== JSON.stringify(DEFAULT_REPORT_FILTERS);
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select className={select} value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as ReportStatus | "" })}>
        <option value="">Tous les statuts</option>
        {(Object.keys(REPORT_STATUS_LABELS) as ReportStatus[]).map((s) => <option key={s} value={s}>{REPORT_STATUS_LABELS[s]}</option>)}
      </select>
      <select className={select} value={value.level} onChange={(e) => onChange({ ...value, level: e.target.value as ReportLevel | "" })}>
        <option value="">Tous les niveaux</option>
        {(Object.keys(REPORT_LEVEL_LABELS) as ReportLevel[]).map((l) => <option key={l} value={l}>{REPORT_LEVEL_LABELS[l]}</option>)}
      </select>
      <select className={select} value={value.reason} onChange={(e) => onChange({ ...value, reason: e.target.value })}>
        <option value="">Tous les motifs</option>
        {REPORT_REASONS.map((r) => <option key={r} value={r}>{REPORT_REASON_LABELS[r]}</option>)}
      </select>
      <select className={select} value={value.targetType} onChange={(e) => onChange({ ...value, targetType: e.target.value as ReportTargetType | "" })}>
        <option value="">Publications et commentaires</option>
        {(Object.keys(TARGET_TYPE_LABELS) as ReportTargetType[]).map((t) => <option key={t} value={t}>{TARGET_TYPE_LABELS[t]}</option>)}
      </select>
      {changed && <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_REPORT_FILTERS)}><X className="mr-1 h-3.5 w-3.5" /> Réinitialiser</Button>}
    </div>
  );
}