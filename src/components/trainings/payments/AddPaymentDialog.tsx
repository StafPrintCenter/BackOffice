import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/data/trainingPayments";
import { useCreateTrainingPayment } from "@/stores/useTrainingPaymentsStore";

/** Valeur initiale d'un <input type="datetime-local"> : maintenant, à l'heure locale. */
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

interface AddPaymentDialogProps {
  enrollmentId: string;
  /** Texte de contexte affiché dans la boîte (ex. nom de l'apprenant + formation) */
  context?: string;
  size?: "sm" | "default";
}

export function AddPaymentDialog({ enrollmentId, context, size = "sm" }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(nowLocal());
  const [error, setError] = useState<string | null>(null);
  const create = useCreateTrainingPayment();

  const reset = () => {
    setAmount(""); setMethod("cash"); setReference(""); setPaidAt(nowLocal()); setError(null);
  };

  const submit = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return setError("Saisissez un montant supérieur à 0.");
    if (!paidAt) return setError("La date de paiement est requise.");
    setError(null);

    create.mutate(
      {
        enrollmentId,
        payload: {
          amount: value,
          method,
          reference: reference.trim() || undefined,
          paid_at: new Date(paidAt).toISOString(),
        },
      },
      {
        onSuccess: () => { toast.success("Paiement enregistré"); setOpen(false); reset(); },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <>
      <Button type="button" size={size} variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Paiement
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            {context && <DialogDescription>{context}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Montant (FCFA)</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex : 25000" />
            </div>
            <div>
              <Label>Moyen de paiement</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (<SelectItem key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Référence (optionnel)</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° de reçu, de transaction…" />
            </div>
            <div>
              <Label>Date et heure du paiement</Label>
              <Input type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}