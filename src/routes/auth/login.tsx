import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

// Définition de la route et de ses métadonnées SEO/robots
export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Connexion admin — Staf Print" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  // Hooks d'authentification et de navigation
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();

  // États locaux du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirection automatique si l'utilisateur est déjà connecté
  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [ready, isAuthenticated, navigate]);

  // Traitement de la soumission du formulaire
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Connexion réussie");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* SECTION GAUCHE : Visuel d'accueil & Présentation (visible uniquement sur écran large) */}
      <div className="hidden lg:flex bg-gradient-hero p-12 text-primary-foreground flex-col justify-between">
        <div className="flex items-center">
          <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
        </div>

        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-balance">
            Pilotez votre studio en un coup d'œil.
          </h1>
          <p className="mt-4 opacity-90">
            Tableau de bord centralisé pour services, formations, projets, articles et témoignages.
          </p>
        </div>

        <div className="text-sm opacity-70">
          © {new Date().getFullYear()} {SITE.name}
        </div>
      </div>

      {/* SECTION DROITE : Formulaire de connexion */}
      <div className="flex items-center justify-center p-8 bg-grain">
        <div className="w-full max-w-md">
          {/* Logo sur mobile */}
          <div className="lg:hidden mb-8">
            <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
          </div>

          <h2 className="font-display text-3xl font-bold">Connexion admin</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous avec vos identifiants administrateur.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {/* Champ Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="admin@stafprint.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card shadow-sm"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5">
              <Label htmlFor="pw">Mot de passe</Label>
              <div className="relative mt-1">
                <Input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-card shadow-sm"
                />

                {/* Bouton pour basculer la visibilité du mot de passe */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Bouton de soumission avec icône de chargement */}
            <Button type="submit" disabled={loading} className="w-full cursor-pointer mt-2">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}