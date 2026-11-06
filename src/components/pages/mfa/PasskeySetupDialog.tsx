import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PasswordField } from "@/components/site/PasswordField";
import { useAdminPasskeyOptions, useRegisterAdminPasskey } from "@/stores/usePasskeysStore";
import { createPasskeyCredential } from "@/lib/webauthn";
import type { APIAdminPasskeyCreationOptions } from "@/data/passkeys";

interface PasskeySetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Reçoit les codes de secours générés à la première configuration MFA */
  onRegistered: (recoveryCodes?: string[]) => void;
}

export function PasskeySetupDialog({ open, onOpenChange, onRegistered }: PasskeySetupDialogProps) {
  const optionsMutation = useAdminPasskeyOptions();
  const registerMutation = useRegisterAdminPasskey();

  const [step, setStep] = useState<"password" | "create">("password");
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState<APIAdminPasskeyCreationOptions | null>(null);
  const [name, setName] = useState("");
  const [makeDefault, setMakeDefault] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("password"); setPassword(""); setOptions(null);
    setName(""); setMakeDefault(false); setCreating(false); setError("");
  }, [open]);

  const pending = optionsMutation.isPending || creating;

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    optionsMutation.mutate({ password }, {
      onSuccess: (data) => { setOptions(data); setPassword(""); setStep("create"); },
      onError: (err) => setError(err.message),
    });
  };

  const submitCreate = async () => {
    if (!options) return;
    setError("");

    const trimmed = name.trim();
    if (trimmed.length > 100) {
      setError("Le nom ne doit pas dépasser 100 caractères.");
      return;
    }

    setCreating(true);

    let credential: string;
    try {
      credential = await createPasskeyCredential(options);
    } catch (err) {
      // Annulation ou refus côté navigateur : le défi serveur est toujours valide
      setError(err instanceof Error ? err.message : "Impossible de créer la clé d'accès.");
      setCreating(false);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        credential,
        name: trimmed || undefined,
        makeDefault,
      });
      toast.success("Clé d'accès ajoutée");
      onOpenChange(false);
      onRegistered(result.recoveryCodes);
    } catch (err) {
      // Le serveur a consommé le défi (usage unique) : on repart de l'étape 1
      setOptions(null);
      setStep("password");
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer la clé d'accès.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-w-md">
        {step === "password" ? (
          <form onSubmit={submitPassword} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Ajouter une clé d'accès</DialogTitle>
              <DialogDescription>
                Utilisez l'empreinte, le visage, le code de votre appareil ou une clé de sécurité. Confirmez d'abord votre mot de passe.
              </DialogDescription>
            </DialogHeader>
            <PasswordField
              id="passkey-password" label="Mot de passe actuel" value={password}
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
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Créer votre clé d'accès</DialogTitle>
              <DialogDescription>
                Donnez un nom à cette clé pour la reconnaître ensuite, puis suivez les instructions de votre appareil.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="passkey-name">Nom de la clé (optionnel)</Label>
              <Input
                id="passkey-name" className="bg-card" placeholder="Ex. : Mon téléphone"
                value={name} onChange={(e) => setName(e.target.value)} disabled={pending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="passkey-default" className="cursor-pointer">Utiliser comme méthode par défaut</Label>
              <Switch id="passkey-default" checked={makeDefault} onCheckedChange={setMakeDefault} disabled={pending} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setStep("password"); setError(""); }} disabled={pending}>
                Recommencer
              </Button>
              <Button type="button" onClick={submitCreate} disabled={pending}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Créer la clé d'accès
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}