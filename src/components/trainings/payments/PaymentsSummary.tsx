import { Wallet } from "lucide-react";
import { formatFcfa } from "@/data/trainingEnrollments";
import { getPaymentMethodLabel, type APIPaymentsSummary } from "@/data/trainingPayments";

export function PaymentsSummary({ summary }: { summary: APIPaymentsSummary }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Total encaissé</div>
        <div className="mt-1 font-display text-2xl font-bold">{formatFcfa(summary.totalAmount)}</div>
        <div className="text-[11px] text-muted-foreground">selon les filtres appliqués</div>
      </div>
      {summary.byMethod.map((m) => (
        <div key={m.method} className="rounded-2xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">{getPaymentMethodLabel(m.method)}</div>
          <div className="mt-1 font-display text-xl font-bold">{formatFcfa(m.total)}</div>
          <div className="text-[11px] text-muted-foreground">{m.count} paiement{m.count > 1 ? "s" : ""}</div>
        </div>
      ))}
    </div>
  );
}