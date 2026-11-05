import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/site/PasswordField";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useConfirmAdminEmailChange, useRequestAdminEmailChange } from "@/stores/useAccountStore";

const requestSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "La nouvelle adresse est requise")
    .email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Le code contient 6 chiffres");

interface EmailChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailChangeDialog({ open, onOpenChange }: EmailChangeDialogProps) {
  const { user, setUser } = useAdminAuth();
  const requestMutation = useRequestAdminEmailChange();
  const confirmMutation = useConfirmAdminEmailChange();
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("request");
    setNewEmail("");
    setPassword("");
    setCode("");
    setHint("");
    setExpiresInMinutes(null);
    setError("");
  }, [open]);

  const submitRequest = () => {
    setError("");
    const parsed = requestSchema.safeParse({ newEmail, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      return;
    }
    if (parsed.data.newEmail.toLowerCase() === user?.email.toLowerCase()) {
      setError("Cette adresse est déjà associée à votre compte.");
      return;
    }

    requestMutation.mutate(parsed.data, {
      onSuccess: (response) => {
        setHint(response.hint);
        setExpiresInMinutes(response.expiresInMinutes);
        setPassword("");
        setStep("confirm");
        toast.success(response.message);
      },
      onError: (requestError) =>
        setError(
          requestError instanceof Error ? requestError.message : "Impossible d'envoyer le code.",
        ),
    });
  };

  const submitConfirm = () => {
    setError("");
    const parsed = codeSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Code invalide.");
      return;
    }

    confirmMutation.mutate(
      { code: parsed.data },
      {
        onSuccess: (profile) => {
          setUser(profile);
          toast.success("Adresse e-mail modifiée");
          onOpenChange(false);
        },
        onError: (confirmError) =>
          setError(
            confirmError instanceof Error ? confirmError.message : "Code invalide ou expiré.",
          ),
      },
    );
  };

  const pending = requestMutation.isPending || confirmMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer mon adresse e-mail</DialogTitle>
          <DialogDescription>
            {step === "request"
              ? `Adresse actuelle : ${user?.email ?? ""}. Un code sera envoyé à la nouvelle adresse.`
              : `Un code a été envoyé à ${hint}. Il expire dans ${expiresInMinutes} minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-new-email">Nouvelle adresse e-mail</Label>
              <Input
                id="admin-new-email"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                disabled={pending}
              />
            </div>
            <PasswordField
              id="admin-email-current-password"
              label="Mot de passe actuel"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              disabled={pending}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="admin-email-code">Code de confirmation</Label>
            <Input
              id="admin-email-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              disabled={pending}
            />
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
        <DialogFooter>
          {step === "confirm" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep("request");
                setError("");
              }}
              disabled={pending}
            >
              Changer d'adresse
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={step === "request" ? submitRequest : submitConfirm}
            disabled={pending}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step === "request" ? "Envoyer le code" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
