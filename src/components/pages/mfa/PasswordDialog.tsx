import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/site/PasswordField";

interface MfaPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  isPending: boolean;
  errorMessage?: string | null;
  onConfirm: (password: string) => void;
}

export function MfaPasswordDialog({
  open, onOpenChange, title, description, confirmLabel, destructive, isPending, errorMessage, onConfirm,
}: MfaPasswordDialogProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) onConfirm(password);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <PasswordField
            id="mfa-password"
            label="Mot de passe actuel"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={isPending}
          />
          {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={isPending || !password}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}