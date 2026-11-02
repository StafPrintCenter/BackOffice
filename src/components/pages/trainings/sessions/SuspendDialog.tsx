import { useState } from "react";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSuspendSession } from "@/stores/useTrainingSessionsStore";

export function SuspendSessionDialog({ sessionId, title }: { sessionId: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const suspend = useSuspendSession();

  const submit = () => {
    if (!reason.trim()) return setError("Le motif est obligatoire.");
    setError(null);
    suspend.mutate({ id: sessionId, reason: reason.trim() }, {
      onSuccess: () => { toast.success("Session suspendue"); setOpen(false); setReason(""); },
      onError: (e) => setError(e.message),
    });
  };

  return (
    <>
      <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setOpen(true)}>
        <Ban className="mr-1 h-4 w-4" /> Suspendre
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setReason(""); setError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Suspendre la session
            </DialogTitle>
            <DialogDescription>
              « {title} » ne sera plus proposée. Le formateur pourra demander un examen.
            </DialogDescription>
          </DialogHeader>

          <div>
            <Label>Motif</Label>
            <Textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : hors du cadre de la formation…" />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={submit} disabled={suspend.isPending}>
              {suspend.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}