import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PasswordField } from "@/components/site/PasswordField";
import { PasswordRequirements } from "@/components/site/PasswordRequirements";
import { getPasswordPolicyError } from "@/lib/password-policy";
import { useChangeAdminPassword } from "@/stores/useAccountStore";

export function ChangePasswordCard() {
  const changePassword = useChangeAdminPassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    changePassword.mutate(
      { currentPassword, password, passwordConfirmation, revokeOtherSessions },
      {
        onSuccess: (response) => {
          setCurrentPassword("");
          setPassword("");
          setPasswordConfirmation("");
          setRevokeOtherSessions(false);
          toast.success(response.message);
          if (response.revokedSessions > 0) {
            toast.info(
              `${response.revokedSessions} autre${response.revokedSessions > 1 ? "s" : ""} session${response.revokedSessions > 1 ? "s" : ""} déconnectée${response.revokedSessions > 1 ? "s" : ""}.`,
            );
          }
        },
        onError: (requestError) => setError(requestError.message),
      },
    );
  };

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 border-b pb-4">
        <KeyRound className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-display text-lg font-semibold">Changer le mot de passe</h2>
          <p className="text-sm text-muted-foreground">
            Saisissez votre mot de passe actuel et choisissez-en un nouveau.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <PasswordField
          id="current-password"
          label="Mot de passe actuel"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          disabled={changePassword.isPending}
        />
        <PasswordField
          id="new-password"
          label="Nouveau mot de passe"
          value={password}
          onChange={setPassword}
          disabled={changePassword.isPending}
        />
        <PasswordField
          id="password-confirmation"
          label="Confirmer le nouveau mot de passe"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          disabled={changePassword.isPending}
        />

        <div className="flex items-start gap-3">
          <Switch
            id="revoke-other-sessions"
            checked={revokeOtherSessions}
            onCheckedChange={setRevokeOtherSessions}
            disabled={changePassword.isPending}
          />
          <Label htmlFor="revoke-other-sessions" className="cursor-pointer leading-5">
            Déconnecter les autres sessions
            <span className="block font-normal text-muted-foreground">
              Cette session restera active.
            </span>
          </Label>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Modifier le mot de passe
        </Button>
      </form>
    </section>
  );
}
