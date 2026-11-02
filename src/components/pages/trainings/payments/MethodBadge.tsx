import { Banknote, Building2, CircleDollarSign, Smartphone, type LucideIcon } from "lucide-react";
import { getPaymentMethodLabel } from "@/data/trainingPayments";

const ICONS: Record<string, LucideIcon> = {
  cash: Banknote, mobile_money: Smartphone, bank_transfer: Building2, other: CircleDollarSign,
};

export function PaymentMethodBadge({ method }: { method: string }) {
  const Icon = ICONS[method] ?? CircleDollarSign;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-[11px] font-medium">
      <Icon className="h-3 w-3" /> {getPaymentMethodLabel(method)}
    </span>
  );
}