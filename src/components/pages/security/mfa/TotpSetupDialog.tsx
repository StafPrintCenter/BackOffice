import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PasswordField } from "@/components/site/PasswordField";
import { useSetupAdminMfaTotp, useConfirmAdminMfaTotp } from "@/stores/useMfaStore";
import type { APIAdminMfaTotpSetup } from "@/data/mfa";

const codeSchema = z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres.");

interface TotpSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TotpSetupDialog({ open, onOpenChange }: TotpSetupDialogProps) {
  const setupTotp = useSetupAdminMfaTotp();
  const confirmTotp = useConfirmAdminMfaTotp();

  const [password, setPassword] = useState("");
  const [setup, setSetup] = useState<APIAdminMfaTotpSetup | null>(null);
  const [code, setCode] = useState("");
  const [makeDefault, setMakeDefault] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword(""); setSetup(null); setCode(""); setMakeDefault(true); setError("");
  }, [open]);

  const pending = setupTotp.isPending || confirmTotp.isPending;

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setupTotp.mutate({ password }, {
      onSuccess: (data) => { setSetup(data); setPassword(""); },
      onError: (err) => setError(err.message),
    });
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Code invalide.");
      return;
    }
    confirmTotp.mutate({ code: parsed.data, makeDefault }, {
      onSuccess: () => {
        toast.success("Application d'authentification activée");
        onOpenChange(false);
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {!setup ? (
          <form onSubmit={submitPassword} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Ajouter une application d'authentification</DialogTitle>
              <DialogDescription>Confirmez votre mot de passe pour générer votre clé de configuration.</DialogDescription>
            </DialogHeader>
            <PasswordField
              id="totp-password" label="Mot de passe actuel" value={password}
              onChange={setPassword} autoComplete="current-password" disabled={pending}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Annuler</Button>
              <Button type="submit" disabled={pending || !password}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Continuer
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Scannez le QR code</DialogTitle>
              <DialogDescription>
                Ouvrez votre application (Google Authenticator, Authy…), scannez le code puis saisissez le code à 6 chiffres affiché.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center rounded-xl border bg-white p-4">
              <QRCodeSVG value={setup.otpauthUri} size={176} />
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Ou saisissez la clé manuellement :
              <code className="mt-1 block break-all font-mono text-sm text-foreground">{setup.secret}</code>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totp-code">Code de vérification</Label>
              <Input
                id="totp-code" inputMode="numeric" maxLength={6} className="bg-card tracking-[0.4em]"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} disabled={pending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="totp-default" className="cursor-pointer">Utiliser comme méthode par défaut</Label>
              <Switch id="totp-default" checked={makeDefault} onCheckedChange={setMakeDefault} disabled={pending} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Annuler</Button>
              <Button type="submit" disabled={pending || code.length !== 6}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Activer
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}