import { useState } from "react";
import { toast } from "sonner";
import { Award, Ban, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRegenerateCertificate, useRevokeCertificate } from "@/stores/useTrainingCertificatesStore";

interface CertificateActionsProps {
  enrollmentId: string;
  /** Requis pour révoquer ; absent = révocation indisponible */
  certificateId?: string | null;
  certificateStatus: string;
  progress: number;
  context?: string;
}

export function CertificateActions({ enrollmentId, certificateId, certificateStatus, progress, context }: CertificateActionsProps) {
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const regenerate = useRegenerateCertificate();
  const revoke = useRevokeCertificate();

  const isRevoked = certificateStatus === "revoked";
  const canRevoke = !!certificateId && !isRevoked && certificateStatus !== "not_eligible";
  // Le backend refuse la génération sous 100 % : on évite l'aller-retour inutile
  const canRegenerate = progress >= 100;

  const handleRegenerate = () =>
    regenerate.mutate(enrollmentId, {
      onSuccess: (m) => toast.success(m),
      onError: (e) => toast.error(e.message),
    });

  const handleRevoke = () => {
    if (!reason.trim()) return setError("Le motif est obligatoire.");
    setError(null);
    revoke.mutate(
      { certificateId: certificateId as string, reason: reason.trim() },
      {
        onSuccess: (m) => { toast.success(m); setRevokeOpen(false); setReason(""); },
        onError: (e) => setError(e.message),
      },
    );
  };

  if (!canRegenerate && !canRevoke) return null;

  return (
    <>
      {canRegenerate && (
        <Button
          type="button" size="sm" variant="outline"
          onClick={handleRegenerate} disabled={regenerate.isPending}
          title="Relance la génération. Un certificat actif doit d'abord être révoqué."
        >
          {regenerate.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : isRevoked ? <RefreshCw className="mr-1 h-3.5 w-3.5" /> : <Award className="mr-1 h-3.5 w-3.5" />}
          {isRevoked ? "Régénérer" : "Générer"}
        </Button>
      )}

      {canRevoke && (
        <Button
          type="button" size="sm" variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => setRevokeOpen(true)}
        >
          <Ban className="mr-1 h-3.5 w-3.5" /> Révoquer
        </Button>
      )}

      <Dialog open={revokeOpen} onOpenChange={(v) => { setRevokeOpen(v); if (!v) { setReason(""); setError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Révoquer le certificat</DialogTitle>
            <DialogDescription>{context ? `${context} — ` : ""}Le certificat ne sera plus valide. Vous pourrez ensuite en régénérer un nouveau.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Motif de la révocation</Label>
            <Textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : erreur sur le nom, fraude, réémission demandée…" />
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoke.isPending}>
              {revoke.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer la révocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}