import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuthShellContent } from "@/components/site/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SITE } from "@/data/site";
import { PasswordRequirements } from "@/components/site/PasswordRequirements";
import { isPasswordPolicyValid } from "@/lib/password-policy";

// token et email viennent du lien reçu par e-mail. Optionnels ici pour afficher
// un état "lien invalide" propre au lieu d'une erreur de routeur.
const searchSchema = z.object({
  token: z.string().optional(),
  email: z.string().optional(),
});

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Nouveau mot de passe | ${SITE.name}` },
      {
        name: "description",
        content: `Choisissez un nouveau mot de passe pour votre compte administrateur ${SITE.name}.`,
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().refine(isPasswordPolicyValid, "Le mot de passe ne respecte pas les critères affichés."),
    passwordConfirmation: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Les mots de passe ne correspondent pas.",
  });

function ResetPasswordPage() {
  const { token, email } = Route.useSearch();
  const { resetPassword } = useAdminAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const linkInvalid = !token || !email;

  // Calculé AVANT tout return conditionnel (règles des Hooks)
  useAuthShellContent(
    done
      ? { title: "Mot de passe modifié", subtitle: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe." }
      : linkInvalid
        ? { title: "Lien invalide", subtitle: "Ce lien de réinitialisation est incomplet ou a expiré." }
        : { title: "Nouveau mot de passe", subtitle: `Choisissez un nouveau mot de passe pour ${email}.` },
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return;
    setApiError("");

    const parsed = schema.safeParse({ password, passwordConfirmation });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const result = await resetPassword({
        email,
        token,
        password: parsed.data.password,
        passwordConfirmation: parsed.data.passwordConfirmation,
      });
      toast.success(result.message || "Mot de passe modifié");
      setDone(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
    }
  };

  if (linkInvalid) {
    return (
      <div className="text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
        <Button asChild className="mt-6 w-full">
          <Link to="/forgot-password">Demander un nouveau lien</Link>
        </Button>
        <Button variant="outline" className="mt-3 w-full" onClick={() => navigate({ to: "/login" })}>
          Retour à la connexion
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <Button className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
          Aller à la connexion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="pw">Nouveau mot de passe</Label>
        <div className="relative mt-1">
          <Input
            id="pw"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-card pr-10"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordRequirements value={password} />
        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
      </div>

      <div>
        <Label htmlFor="pw-confirm">Confirmer le mot de passe</Label>
        <Input
          id="pw-confirm"
          type={showPassword ? "text" : "password"}
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className="mt-1 bg-card"
          disabled={loading}
        />
        {errors.passwordConfirmation && (
          <p className="mt-1 text-xs text-destructive">{errors.passwordConfirmation}</p>
        )}
      </div>

      {apiError && <p className="text-xs text-destructive">{apiError}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Modification...
          </>
        ) : (
          "Modifier le mot de passe"
        )}
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Annuler
        </Link>
      </div>
    </form>
  );
}