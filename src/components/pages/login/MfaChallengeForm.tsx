import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { APIAdminMfaChallenge, AdminMfaLoginMethod } from "@/data/auth";
import { AdminMfaLoginError } from "@/stores/useAuthStore";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MfaMethodSwitcher } from "./MfaMethodSwitcher";
import { ResendEmailCodeButton } from "./ResendEmailCodeButton";
import { useCountdown } from "./useCountdown";

const RESEND_DELAY_SECONDS = 60;
const sixDigits = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Le code contient 6 chiffres.");
const codeSchemas: Record<AdminMfaLoginMethod, z.ZodType<string>> = {
  email: sixDigits,
  totp: sixDigits,
  recovery: z.string().trim().min(1, "Saisissez un code de secours."),
};

interface MfaChallengeFormProps {
  challenge: APIAdminMfaChallenge;
  onBack: () => void;
  onVerified: () => void;
}

export function MfaChallengeForm({ challenge, onBack, onVerified }: MfaChallengeFormProps) {
  const { verifyMfa, sendMfaEmailCode } = useAdminAuth();
  const { remaining, start } = useCountdown();
  const [method, setMethod] = useState<AdminMfaLoginMethod>(challenge.defaultMethod);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [emailSent, setEmailSent] = useState(challenge.emailCodeSent);
  const [emailHint, setEmailHint] = useState(
    challenge.methods.find((item) => item.type === "email")?.hint ?? "",
  );

  const available: AdminMfaLoginMethod[] = [
    ...challenge.methods.map((item) => item.type),
    ...(challenge.recoveryCodesAvailable ? (["recovery"] as const) : []),
  ];

  useEffect(() => {
    if (challenge.emailCodeSent) start(RESEND_DELAY_SECONDS);
  }, [challenge.emailCodeSent, start]);

  const sendEmail = async (): Promise<boolean> => {
    setSending(true);
    try {
      const response = await sendMfaEmailCode(challenge.challengeToken);
      setEmailSent(response.emailCodeSent);
      setEmailHint(response.hint);
      start(response.retryAfter);
      if (response.emailCodeSent) toast.success("Un code vous a été envoyé par e-mail.");
      return true;
    } catch (sendError) {
      if (sendError instanceof AdminMfaLoginError) {
        if (sendError.status === 429 && sendError.retryAfter) {
          setEmailSent(true);
          start(sendError.retryAfter);
          return true;
        }
        if (sendError.code === "challenge_expired") {
          toast.error(sendError.message);
          onBack();
          return false;
        }
      }
      toast.error(sendError instanceof Error ? sendError.message : "Impossible d'envoyer le code.");
      return false;
    } finally {
      setSending(false);
    }
  };

  const selectMethod = async (nextMethod: AdminMfaLoginMethod) => {
    setError("");
    setAttemptsLeft(null);
    setCode("");
    if (nextMethod === "email" && !emailSent && !(await sendEmail())) return;
    setMethod(nextMethod);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } catch (verifyError) {
      if (
        verifyError instanceof AdminMfaLoginError &&
        (verifyError.code === "challenge_expired" || verifyError.code === "too_many_attempts")
      ) {
        toast.error(verifyError.message);
        onBack();
        return;
      }
      setError(verifyError instanceof Error ? verifyError.message : "Code invalide ou expiré.");
      setAttemptsLeft(
        verifyError instanceof AdminMfaLoginError ? (verifyError.attemptsLeft ?? null) : null,
      );
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const description =
    method === "email"
      ? `Saisissez le code à 6 chiffres envoyé à ${emailHint}.`
      : method === "totp"
        ? "Saisissez le code à 6 chiffres affiché par votre application d'authentification."
        : "Saisissez l'un de vos codes de secours. Chaque code ne peut servir qu'une fois.";
  const isRecovery = method === "recovery";

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="space-y-2">
        <Label htmlFor="mfa-code">{isRecovery ? "Code de secours" : "Code de vérification"}</Label>
        <Input
          id="mfa-code"
          className={isRecovery ? "bg-card" : "bg-card tracking-[0.4em]"}
          inputMode={isRecovery ? "text" : "numeric"}
          autoComplete="one-time-code"
          maxLength={isRecovery ? 32 : 6}
          value={code}
          onChange={(event) =>
            setCode(
              isRecovery ? event.target.value.toLowerCase() : event.target.value.replace(/\D/g, ""),
            )
          }
          disabled={loading || sending}
          autoFocus
        />
        {error && (
          <p className="text-xs text-destructive">
            {error}
            {attemptsLeft !== null &&
              ` (${attemptsLeft} essai${attemptsLeft > 1 ? "s" : ""} restant${attemptsLeft > 1 ? "s" : ""})`}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading || sending || !code}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vérification...
          </>
        ) : (
          "Vérifier"
        )}
      </Button>

      {method === "email" && (
        <ResendEmailCodeButton remaining={remaining} sending={sending} onResend={sendEmail} />
      )}
      <MfaMethodSwitcher
        available={available}
        active={method}
        disabled={loading || sending}
        onSelect={selectMethod}
      />
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
