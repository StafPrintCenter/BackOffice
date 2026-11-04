import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuthShellContent } from "@/components/site/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Mot de passe oublié | ${SITE.name}` },
      {
        name: "description",
        content: `Recevez un lien de réinitialisation de mot de passe pour votre compte administrateur ${SITE.name}.`,
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().min(1, "L'adresse e-mail est requise").email("Adresse e-mail invalide"),
});

function ForgotPasswordPage() {
  const { forgotPassword } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  // Calculé AVANT tout return conditionnel (règles des Hooks)
  useAuthShellContent(
    sentMessage
      ? {
        title: "Vérifiez votre boîte mail",
        subtitle: "Si un compte correspond à cette adresse, vous allez recevoir un lien de réinitialisation.",
      }
      : {
        title: "Mot de passe oublié",
        subtitle: "Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.",
      },
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Adresse e-mail invalide");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(parsed.data.email);
      setSentMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi de l'e-mail");
    } finally {
      setLoading(false);
    }
  };

  if (sentMessage) {
    return (
      <div className="text-center">
        <MailCheck className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <p className="text-sm text-muted-foreground">{sentMessage}</p>
        <Button asChild className="mt-6 w-full">
          <Link to="/login">Retour à la connexion</Link>
        </Button>
        <button
          type="button"
          onClick={() => setSentMessage(null)}
          className="mt-4 cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Renvoyer avec une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@votreadresse.com"
          autoComplete="email"
          className="mt-1 bg-card"
          disabled={loading}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          "Envoyer le lien"
        )}
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Retour à la connexion
        </Link>
      </div>
    </form>
  );
}