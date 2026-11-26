import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface UserActionDialogsProps {
  userName: string;
  alertOpen: boolean;
  blockOpen: boolean;
  isAlertPending: boolean;
  isBlockPending: boolean;
  onAlertOpenChange: (open: boolean) => void;
  onBlockOpenChange: (open: boolean) => void;
  onSubmitAlert: (subject: string, message: string) => void;
  onSubmitBlock: (reason: string) => void;
}

export function UserActionDialogs({
  userName,
  alertOpen,
  blockOpen,
  isAlertPending,
  isBlockPending,
  onAlertOpenChange,
  onBlockOpenChange,
  onSubmitAlert,
  onSubmitBlock,
}: UserActionDialogsProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [alertErrors, setAlertErrors] = useState<Record<string, string>>({});
  const [blockReason, setBlockReason] = useState("");
  const [blockError, setBlockError] = useState("");

  useEffect(() => {
    if (alertOpen) {
      setSubject("");
      setMessage("");
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
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    if (!trimmedSubject || !trimmedMessage) {
      setAlertErrors({
        subject: trimmedSubject ? "" : "Le sujet est requis",
        message: trimmedMessage ? "" : "Le message est requis",
      });
      return;
    }
    setAlertErrors({});
    onSubmitAlert(trimmedSubject, trimmedMessage);
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

  return (
    <>
      <Dialog open={alertOpen} onOpenChange={onAlertOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Avertir l'utilisateur</DialogTitle>
            <DialogDescription>
              Envoie une notification d'avertissement directement à l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="user-alert-subject">Sujet de l'avertissement</Label>
              <Input
                id="user-alert-subject"
                placeholder="Ex: Non-respect des règles de la plateforme"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
              {alertErrors.subject && (
                <p className="mt-1 text-xs text-destructive">{alertErrors.subject}</p>
              )}
            </div>
            <div>
              <Label htmlFor="user-alert-message">Message</Label>
              <Textarea
                id="user-alert-message"
                rows={4}
                placeholder="Explication détaillée..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
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
            <DialogTitle className="text-destructive">Bloquer {userName}</DialogTitle>
            <DialogDescription>
              Cette action restreindra immédiatement l'accès de l'utilisateur à la plateforme.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="user-block-reason">Motif explicite du blocage</Label>
              <Textarea
                id="user-block-reason"
                rows={3}
                placeholder="Renseignez le motif qui justifie la suspension du compte..."
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
    </>
  );
}
