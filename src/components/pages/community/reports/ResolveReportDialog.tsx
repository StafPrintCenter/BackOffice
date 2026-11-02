import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RESOLVE_ACTION_LABELS, type APIReport, type ResolveAction } from "@/data/communityAdmin";
import { useResolveReport } from "@/stores/useCommunityAdminStore";
import { ReportTarget } from "./ReportTarget";

interface Props { report: APIReport; open: boolean; onOpenChange: (v: boolean) => void }

export function ResolveReportDialog({ report, open, onOpenChange }: Props) {
  const [action, setAction] = useState<ResolveAction>("dismiss");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const resolve = useResolveReport();

  const canAct = report.target.exists;
  const noteRequired = action === "hide";

  const close = (v: boolean) => { onOpenChange(v); if (!v) { setAction("dismiss"); setNote(""); setError(null); } };

  const submit = () => {
    if (noteRequired && !note.trim()) return setError("Le motif est obligatoire pour masquer un contenu.");
    setError(null);
    resolve.mutate({ id: report.id, action, note: note.trim() || undefined }, {
      onSuccess: () => { toast.success("Signalement traité"); close(false); },
      onError: (e) => setError(e.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Traiter le signalement</DialogTitle>
          <DialogDescription>Tous les signalements en attente sur ce contenu seront clos et leurs auteurs notifiés.</DialogDescription>
        </DialogHeader>

        <ReportTarget target={report.target} />

        <div className="space-y-1.5">
          {(Object.keys(RESOLVE_ACTION_LABELS) as ResolveAction[]).map((a) => {
            const disabled = a !== "dismiss" && !canAct;
            return (
              <label key={a} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${action === a ? "border-primary bg-primary/5" : "hover:bg-muted/50"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
                <input type="radio" name="resolve-action" className="mt-1" disabled={disabled} checked={action === a} onChange={() => setAction(a)} />
                <span>
                  <span className={`block font-medium ${a === "delete" ? "text-destructive" : ""}`}>{RESOLVE_ACTION_LABELS[a].label}</span>
                  <span className="block text-xs text-muted-foreground">{RESOLVE_ACTION_LABELS[a].hint}</span>
                </span>
              </label>
            );
          })}
        </div>

        <div>
          <Label>Note {noteRequired ? <span className="text-destructive">*</span> : "(optionnelle)"}</Label>
          <Textarea rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder={action === "dismiss" ? "Raison du rejet…" : "Motif communiqué à l'auteur…"} />
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)}>Annuler</Button>
          <Button variant={action === "delete" ? "destructive" : "default"} onClick={submit} disabled={resolve.isPending}>
            {resolve.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}