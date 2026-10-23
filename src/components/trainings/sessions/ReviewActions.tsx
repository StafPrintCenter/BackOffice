import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useReviewSessionRequest } from "@/stores/useTrainingSessionsStore";

type Mode = "validated" | "rejected" | null;

export function ReviewActions({ requestId, sessionTitle }: { requestId: string; sessionTitle: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const review = useReviewSessionRequest();

  const close = () => { setMode(null); setReason(""); setError(null); };

  const submit = () => {
    if (!mode) return;
    if (mode === "rejected" && !reason.trim()) return setError("Le motif de rejet est obligatoire.");
    setError(null);
    review.mutate({ requestId, decision: mode, reason: mode === "rejected" ? reason.trim() : undefined }, {
      onSuccess: (m) => { toast.success(m); close(); },
      onError: (e) => setError(e.message),
    });
  };

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setMode("validated")}><Check className="mr-1 h-3.5 w-3.5" /> Valider</Button>
        <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setMode("rejected")}>
          <X className="mr-1 h-3.5 w-3.5" /> Rejeter
        </Button>
      </div>

      <Dialog open={!!mode} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "validated" ? "Valider la demande" : "Rejeter la demande"}</DialogTitle>
            <DialogDescription>
              {mode === "validated"
                ? `La session « ${sessionTitle} » sera réactivée et les participants en seront informés.`
                : `La session « ${sessionTitle} » restera suspendue. Le formateur recevra le motif.`}
            </DialogDescription>
          </DialogHeader>
          {mode === "rejected" && (
            <div>
              <Label>Motif du rejet</Label>
              <Textarea rows={3} maxLength={2000} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={close}>Annuler</Button>
            <Button variant={mode === "rejected" ? "destructive" : "default"} onClick={submit} disabled={review.isPending}>
              {review.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}