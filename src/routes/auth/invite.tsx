import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

const searchSchema = z.object({
  admin: z.string(),
  expires: z.string(),
  signature: z.string(),
});

export const Route = createFileRoute("/auth/invite")({
  head: () => ({
    meta: [{ title: `Accepter l'invitation | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: searchSchema,
  component: InviteAcceptPage,
});

// ⚠️ À adapter : ce endpoint doit être appelé SANS session (le nouvel admin n'est
// pas encore connecté). Remplacez par le helper "public" réel du projet
// (probablement le même utilisé en interne par useAuth().login) si adminFetch
// exige un Authorization Bearer.
async function acceptInvite(params: { admin: string; expires: string; signature: string; password: string }) {
  const qs = new URLSearchParams({
    admin: params.admin,
    expires: params.expires,
    signature: params.signature,
  });
  const fd = new FormData();
  fd.append("password", params.password);

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/admin/auth/invite-accept?${qs.toString()}`,
    { method: "POST", body: fd }
  );

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || "Ce lien d'invitation est invalide ou a expiré.");
  }
  return body as { message: string };
}

function InviteAcceptPage() {
  const { admin, expires, signature } = Route.useSearch();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Colonne gauche */}
      <div className="hidden lg:flex bg-gradient-hero p-12 text-primary-foreground flex-col justify-between">
        <div className="flex items-center">
          <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
        </div>

        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-balance">
            Bienvenue dans l'équipe.
          </h1>
          <p className="mt-4 opacity-90">
            Créez votre mot de passe pour activer votre accès administrateur.
          </p>
        </div>

        <div className="text-sm opacity-70">
          © {new Date().getFullYear()} {SITE.name}
        </div>
      </div>

      {/* Colonne droite */}
      <div className="flex items-center justify-center p-8 bg-grain">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
          </div>

          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h2 className="mt-4 font-display text-2xl font-bold">Compte activé</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous pouvez maintenant vous connecter avec votre e-mail et votre nouveau mot de passe.
              </p>
              <Button className="mt-6 w-full" onClick={() => navigate({ to: "/auth/login" })}>
                Aller à la connexion
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl font-bold">Activer votre compte</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choisissez un mot de passe pour finaliser votre invitation en tant qu'administrateur.
              </p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}