import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { APIAdminAdminDetail } from "@/data/admins";
import { Loader2 } from "lucide-react";

interface AdminActionDialogsProps {
  admin: APIAdminAdminDetail;
  isSelf: boolean;
  alertOpen: boolean;
  blockOpen: boolean;
  revokeInviteOpen: boolean;
  isAlertPending: boolean;
  isBlockPending: boolean;
  isRevokeInvitePending: boolean;
  onAlertOpenChange: (open: boolean) => void;
  onBlockOpenChange: (open: boolean) => void;
  onRevokeInviteOpenChange: (open: boolean) => void;
  onSubmitAlert: (payload: { subject: string; message: string }) => void;
  onSubmitBlock: (reason: string) => void;
  onConfirmRevokeInvite: () => void;
}

export function AdminActionDialogs({
  admin,
  isSelf,
  alertOpen,
  blockOpen,
  revokeInviteOpen,
  isAlertPending,
  isBlockPending,
  isRevokeInvitePending,
  onAlertOpenChange,
  onBlockOpenChange,
  onRevokeInviteOpenChange,
  onSubmitAlert,
  onSubmitBlock,
  onConfirmRevokeInvite,
}: AdminActionDialogsProps) {
  const [alertForm, setAlertForm] = useState({ subject: "", message: "" });
  const [alertErrors, setAlertErrors] = useState<Record<string, string>>({});
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");

  useEffect(() => {
    if (alertOpen) {
      setAlertForm({ subject: "", message: "" });
      setAlertErrors({});
    }
  }, [alertOpen]);

  useEffect(() => {
    if (blockOpen) {
      setBlockReason("");
      setBlockError("");
    }
  }, [blockOpen]);

  const handleSubmitAlert = () => {
    const subject = alertForm.subject.trim();
    const message = alertForm.message.trim();
    if (!subject || !message) {
      setAlertErrors({
        subject: subject ? "" : "Le sujet est requis",
        message: message ? "" : "Le message est requis",
      });
      return;
    }
    setAlertErrors({});
    onSubmitAlert({ subject, message });
  };

  const handleSubmitBlock = () => {
    const reason = blockReason.trim();
    if (!reason) {
      setBlockError("Le motif du blocage est obligatoire");
      return;
    }
    setBlockError("");
    onSubmitBlock(reason);
  };

  if (isSelf) return null;

  return (
    <>
      <Dialog open={alertOpen} onOpenChange={onAlertOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avertir l'administrateur</DialogTitle>
            <DialogDescription>
              Envoie une notification d'avertissement directement à l'administrateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="admin-alert-subject">Sujet de l'avertissement</Label>
              <Input
                id="admin-alert-subject"
                value={alertForm.subject}
                onChange={(event) => setAlertForm({ ...alertForm, subject: event.target.value })}
              />
              {alertErrors.subject && (
                <p className="mt-1 text-xs text-destructive">{alertErrors.subject}</p>
              )}
            </div>
            <div>
              <Label htmlFor="admin-alert-message">Message</Label>
              <Textarea
                id="admin-alert-message"
                rows={4}
                placeholder="Explication détaillée..."
                value={alertForm.message}
                onChange={(event) => setAlertForm({ ...alertForm, message: event.target.value })}
              />
              {alertErrors.message && (
                <p className="mt-1 text-xs text-destructive">{alertErrors.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onAlertOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitAlert} disabled={isAlertPending}>
              {isAlertPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'avertissement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={onBlockOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Bloquer {admin.fullname}</DialogTitle>
            <DialogDescription>
              Cette action restreindra immédiatement les accès d'administration de ce compte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="admin-block-reason">Motif explicite du blocage</Label>
              <Textarea
                id="admin-block-reason"
                rows={3}
                placeholder="Renseignez le motif qui justifie la suspension de cet administrateur..."
                value={blockReason}
                onChange={(event) => setBlockReason(event.target.value)}
              />
              {blockError && <p className="mt-1 text-xs text-destructive">{blockError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onBlockOpenChange(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleSubmitBlock} disabled={isBlockPending}>
              {isBlockPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le blocage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeInviteOpen} onOpenChange={onRevokeInviteOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Révoquer l'invitation</DialogTitle>
            <DialogDescription>
              Le lien d'invitation envoyé à {admin.email} deviendra invalide. Vous pourrez le renvoyer plus tard si besoin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onRevokeInviteOpenChange(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmRevokeInvite}
              disabled={isRevokeInvitePending}
            >
              {isRevokeInvitePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer la révocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
