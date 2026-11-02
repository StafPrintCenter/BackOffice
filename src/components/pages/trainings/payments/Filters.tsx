import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/data/trainingPayments";

export type PaymentsFiltersValue = { query: string; method: PaymentMethod | ""; from: string; to: string };

interface Props {
  value: PaymentsFiltersValue;
  onChange: (v: PaymentsFiltersValue) => void;
  onReset: () => void;
}

export function PaymentsFilters({ value, onChange, onReset }: Props) {
  const active = value.query || value.method || value.from || value.to;
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4">
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Référence, nom ou email…" value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })} />
      </div>
      <select
        value={value.method}
        onChange={(e) => onChange({ ...value, method: e.target.value as PaymentMethod | "" })}
        className="h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="">Tous les moyens</option>
        {PAYMENT_METHODS.map((m) => (<option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>))}
      </select>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        Du <Input type="date" className="w-40" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        au <Input type="date" className="w-40" value={value.to} min={value.from || undefined} onChange={(e) => onChange({ ...value, to: e.target.value })} />
      </label>
      {active && (
        <Button variant="ghost" size="sm" onClick={onReset}><X className="mr-1 h-3.5 w-3.5" /> Réinitialiser</Button>
      )}
    </div>
  );
}