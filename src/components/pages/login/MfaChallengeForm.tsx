import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminMfaLoginError } from "@/stores/useAuthStore";
import { getPasskeyAssertion, isWebAuthnSupported } from "@/lib/webauthn";
import type { APIAdminMfaChallenge, AdminMfaLoginMethod } from "@/data/auth";
import { MfaMethodSwitcher } from "./MfaMethodSwitcher";
import { ResendEmailCodeButton } from "./ResendEmailCodeButton";
import { PasskeyLoginPanel } from "./PasskeyLoginPanel";
import { useCountdown } from "./useCountdown";

const RESEND_DELAY_SECONDS = 60;

const sixDigits = z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres.");
const codeSchemas: Record<Exclude<AdminMfaLoginMethod, "passkey">, z.ZodType<string>> = {
  email: sixDigits,
  totp: sixDigits,
  recovery: z.string().trim().min(1, "Saisissez un code de secours."),
};

const isFatal = (err: unknown) =>
  err instanceof AdminMfaLoginError &&
  (err.code === "challenge_expired" || err.code === "too_many_attempts");

interface MfaChallengeFormProps {
  challenge: APIAdminMfaChallenge;
  onBack: () => void;
  onVerified: () => void;
}

export function MfaChallengeForm({ challenge, onBack, onVerified }: MfaChallengeFormProps) {
  const { verifyMfa, sendMfaEmailCode, getPasskeyLoginOptions } = useAdminAuth();
  const { remaining, start } = useCountdown();

  // Méthodes proposées : le passkey n'est offert que si le navigateur le supporte
  const supported = isWebAuthnSupported();
  const available: AdminMfaLoginMethod[] = [
    ...challenge.methods.map((m) => m.type).filter((t) => t !== "passkey" || supported),
    ...(challenge.recoveryCodesAvailable ? (["recovery"] as const) : []),
  ];
  const initialMethod: AdminMfaLoginMethod = available.includes(challenge.defaultMethod)
    ? challenge.defaultMethod
    : (available[0] ?? "recovery");

  const [method, setMethod] = useState<AdminMfaLoginMethod>(initialMethod);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [emailSent, setEmailSent] = useState(challenge.emailCodeSent);
  const [emailHint, setEmailHint] = useState(
    challenge.methods.find((m) => m.type === "email")?.hint ?? ""
  );

  // Si le code e-mail vient d'être envoyé par le login, le délai de renvoi court déjà
  useEffect(() => {
    if (challenge.emailCodeSent) start(RESEND_DELAY_SECONDS);
  }, [challenge.emailCodeSent, start]);

  const sendEmail = async (): Promise<boolean> => {
    setSending(true);
    try {
      const res = await sendMfaEmailCode(challenge.challengeToken);
      setEmailSent(res.emailCodeSent);
      setEmailHint(res.hint);
      start(res.retryAfter);
      if (res.emailCodeSent) toast.success("Un code vous a été envoyé par e-mail.");
      return true;
    } catch (err) {
      if (err instanceof AdminMfaLoginError) {
        if (err.status === 429 && err.retryAfter) {
          setEmailSent(true);
          start(err.retryAfter);
          return true;
        }
        if (err.code === "challenge_expired") {
          toast.error(err.message);
          onBack();
          return false;
        }
      }
      toast.error(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
      return false;
    } finally {
      setSending(false);
    }
  };

  const selectMethod = async (next: AdminMfaLoginMethod) => {
    setError("");
    setAttemptsLeft(null);
    setCode("");
    if (next === "email" && !emailSent) {
      const ok = await sendEmail();
      if (!ok) return;
    }
    setMethod(next);
  };

  const handleVerifyError = (err: unknown) => {
    if (isFatal(err)) {
      toast.error((err as Error).message);
      onBack(); // il faut se reconnecter
      return;
    }
    setError(err instanceof Error ? err.message : "Code invalide ou expiré.");
    setAttemptsLeft(err instanceof AdminMfaLoginError ? (err.attemptsLeft ?? null) : null);
    setCode("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "passkey") return;
    setError("");

    const parsed = codeSchemas[method].safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Code invalide.");
      return;
    }

    setLoading(true);
    try {
      await verifyMfa({ challengeToken: challenge.challengeToken, method, code: parsed.data });
      onVerified();
    } catch (err) {
      handleVerifyError(err);
    } finally {
      setLoading(false);
    }
  };

  const runPasskey = async () => {
    setError("");
    setAttemptsLeft(null);
    setLoading(true);
    try {
      const options = await getPasskeyLoginOptions(challenge.challengeToken);
      const assertion = await getPasskeyAssertion(options);
      await verifyMfa({ challengeToken: challenge.challengeToken, method: "passkey", code: assertion });
      onVerified();
    } catch (err) {
      handleVerifyError(err);
    } finally {
      setLoading(false);
    }
  };

  const description =
    method === "email"
      ? `Saisissez le code à 6 chiffres envoyé à ${emailHint}.`
      : method === "totp"
        ? "Saisissez le code à 6 chiffres affiché par votre application d'authentification."
        : method === "passkey"
          ? "Confirmez votre identité avec votre clé d'accès (empreinte, visage, code de l'appareil ou clé de sécurité)."
          : "Saisissez l'un de vos codes de secours. Chaque code ne peut servir qu'une fois.";

  const isRecovery = method === "recovery";

  const errorBlock = error && (
    <p className="text-xs text-destructive">
      {error}
      {attemptsLeft !== null && ` (${attemptsLeft} essai${attemptsLeft > 1 ? "s" : ""} restant${attemptsLeft > 1 ? "s" : ""})`}
    </p>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">{description}</p>

      {method === "passkey" ? (
        <>
          <PasskeyLoginPanel loading={loading} onStart={runPasskey} />
          {errorBlock}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="mfa-code">{isRecovery ? "Code de secours" : "Code de vérification"}</Label>
            <Input
              id="mfa-code"
              className={isRecovery ? "bg-card" : "bg-card tracking-[0.4em]"}
              inputMode={isRecovery ? "text" : "numeric"}
              autoComplete="one-time-code"
              maxLength={isRecovery ? 32 : 6}
              value={code}
              onChange={(e) => setCode(isRecovery ? e.target.value.toLowerCase() : e.target.value.replace(/\D/g, ""))}
              disabled={loading || sending}
              autoFocus
            />
            {errorBlock}
          </div>

          <Button type="submit" variant="secondary" className="w-full" disabled={loading || sending || !code}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier"
            )}
          </Button>
        </>
      )}

      {method === "email" && (
        <ResendEmailCodeButton remaining={remaining} sending={sending} onResend={sendEmail} />
      )}

      <MfaMethodSwitcher available={available} active={method} disabled={loading || sending} onSelect={selectMethod} />

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
      >
        Retour à la connexion
      </button>
    </form>
  );
}