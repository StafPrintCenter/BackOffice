import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/site/AuthShell";
import { SITE } from "@/data/site";
import type { AdminInviteVerifyResponse } from "@/data/auth";

const searchSchema = z.object({
  admin: z.string(),
  expires: z.union([z.string(), z.number()]).transform(String),
  signature: z.string(),
});

export const Route = createFileRoute("/_auth/invite")({
  head: () => ({
    meta: [
      { title: `Accepter l'invitation | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: searchSchema,
  component: InviteAcceptPage,
});

type VerifyState =
  | { status: "checking" }
  | { status: "valid"; invitee: AdminInviteVerifyResponse }
  | { status: "invalid"; message: string };

function InviteAcceptPage() {
  const { admin, expires, signature } = Route.useSearch();
  const { verifyInvite, acceptInvite } = useAdminAuth();
  const navigate = useNavigate();

  const [verify, setVerify] = useState<VerifyState>({ status: "checking" });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setVerify({ status: "checking" });

    verifyInvite({ admin, expires, signature })
      .then((invitee) => {
        if (!cancelled) setVerify({ status: "valid", invitee });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setVerify({
            status: "invalid",
            message: err instanceof Error ? err.message : "Ce lien d'invitation est invalide ou a expiré.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [admin, expires, signature, verifyInvite]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const result = await acceptInvite({ admin, expires, signature, password });
      toast.success(result.message || "Compte activé");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'activation du compte");
    } finally {
      setLoading(false);
    }
  };

  if (verify.status === "checking") {
    return (
      <AuthShell title="Vérification..." subtitle="Vérification du lien d'invitation en cours.">
        <div className="py-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AuthShell>
    );
  }

  if (verify.status === "invalid") {
    return (
      <AuthShell title="" subtitle="">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="font-display text-2xl font-bold">Lien invalide</h2>
          <p className="mt-2 text-sm text-muted-foreground">{verify.message}</p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
            Retour à la connexion
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="" subtitle="">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="font-display text-2xl font-bold">Compte activé</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vous pouvez maintenant vous connecter avec votre e-mail et votre nouveau mot de passe.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
            Aller à la connexion
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Activer votre compte"
      subtitle={`Bonjour ${verify.invitee.firstName}, choisissez un mot de passe pour finaliser votre invitation en tant qu'administrateur (${verify.invitee.email}).`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="pw">Mot de passe</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="pw-confirm">Confirmer le mot de passe</Label>
          <Input
            id="pw-confirm"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="mt-1 bg-card"
            disabled={loading}
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Activation...
            </>
          ) : (
            "Activer mon compte"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}