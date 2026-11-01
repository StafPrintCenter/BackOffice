import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subject: string;
  pending: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
}

export function HideDialog({ open, onOpenChange, subject, pending, error, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    if (!reason.trim()) return setLocalError("Le motif est obligatoire.");
    setLocalError(null);
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setReason(""); setLocalError(null); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Masquer {subject}</DialogTitle>
          <DialogDescription>L'auteur en est informé avec le motif. Le contenu reste visible de l'auteur et des modérateurs.</DialogDescription>
        </DialogHeader>
        <div>
          <Label>Motif <span className="text-destructive">*</span></Label>
          <Textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
          {(localError || error) && <p className="mt-1 text-xs text-destructive">{localError ?? error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Masquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}