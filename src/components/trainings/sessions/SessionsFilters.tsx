import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODALITY_LABELS, SESSION_STATUS_LABELS, type SessionModality, type SessionStatus } from "@/data/trainingSessions";

export type SessionsFiltersValue = {
  query: string; status: SessionStatus | ""; modality: SessionModality | "";
  upcoming: boolean; awaitingReview: boolean; from: string; to: string;
};

export const EMPTY_SESSION_FILTERS: SessionsFiltersValue = {
  query: "", status: "", modality: "", upcoming: false, awaitingReview: false, from: "", to: "",
};

const select = "h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-sm";

interface Props { value: SessionsFiltersValue; onChange: (v: SessionsFiltersValue) => void }

export function SessionsFilters({ value, onChange }: Props) {
  const active = JSON.stringify(value) !== JSON.stringify(EMPTY_SESSION_FILTERS);
  return (
    <div className="mb-4 space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher une session…" value={value.query} onChange={(e) => onChange({ ...value, query: e.target.value })} />
        </div>

        <select
          className={select} value={value.status} onChange={(e) => onChange({
            ...value, status: e.target.value as SessionStatus | ""

          })}
        >
          <option value="">Tous les statuts</option>

          {(
            Object.keys(SESSION_STATUS_LABELS) as SessionStatus[]).map((s) =>
              <option key={s} value={s}>
                {SESSION_STATUS_LABELS[s]}
              </option>
            )}
        </select>

        <select
          className={select}
          value={value.modality} onChange={(e) => onChange({ ...value, modality: e.target.value as SessionModality | "" })}>
          <option value="">Toutes modalités</option>

          {(
            Object.keys(MODALITY_LABELS) as SessionModality[]).map((m) =>
              <option key={m} value={m}>
                {MODALITY_LABELS[m]}
              </option>
            )}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          Du <Input
            type="date"
            className="h-8 w-38"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </label>

        <label className="flex items-center gap-2">
          au <Input
            type="date"
            className="h-8 w-38"
            min={value.from || undefined}
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value.upcoming}
            onChange={(e) => onChange({ ...value, upcoming: e.target.checked })}
          />
          À venir
        </label>

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value.awaitingReview}
            onChange={(e) => onChange({ ...value, awaitingReview: e.target.checked })}
          />
          Examen en attente
        </label>

        {
          active && <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_SESSION_FILTERS)}><X className="mr-1 h-3.5 w-3.5" />
            Réinitialiser
          </Button>
        }
      </div>
    </div>
  );
}