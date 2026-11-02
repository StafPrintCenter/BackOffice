import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { REPORT_REASONS, REPORT_REASON_LABELS, type ReactionTarget, type ReportReason } from "@/data/community";
import { AlreadyReportedError, useReportContent } from "@/stores/useCommunityStore";

interface Props { target: ReactionTarget; targetId: string; open: boolean; onOpenChange: (v: boolean) => void }

export function ReportDialog({ target, targetId, open, onOpenChange }: Props) {
  const [reason, setReason] = useState<ReportReason>("inappropriate");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const report = useReportContent(target);

  const label = target === "posts" ? "cette publication" : "ce commentaire";

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) { setReason("inappropriate"); setDetails(""); setError(null); setDoneMessage(null); }
  };

  const submit = () => {
    if (reason === "other" && !details.trim()) return setError("Précisez le motif dans le champ de détails.");
    setError(null);
    report.mutate({ id: targetId, reason, details: details.trim() || undefined }, {
      onSuccess: (r) => setDoneMessage(r.message),
      onError: (e) => {
        if (e instanceof AlreadyReportedError) { toast.info(e.message); close(false); }
        else setError(e.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Flag className="h-4 w-4" /> Signaler {label}</DialogTitle>
          <DialogDescription>Votre signalement est transmis à la modération. Il reste confidentiel.</DialogDescription>
        </DialogHeader>

        {doneMessage ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="text-sm">{doneMessage}</p>
            <Button variant="outline" size="sm" onClick={() => close(false)}>Fermer</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${reason === r ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                    <input type="radio" name="report-reason" checked={reason === r} onChange={() => setReason(r)} />
                    {REPORT_REASON_LABELS[r]}
                  </label>
                ))}
              </div>
              <div>
                <Label>Détails {reason === "other" ? <span className="text-destructive">*</span> : "(optionnel)"}</Label>
                <Textarea rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => close(false)}>Annuler</Button>
              <Button variant="destructive" onClick={submit} disabled={report.isPending}>
                {report.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Signaler
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}