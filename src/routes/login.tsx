import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Printer } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion admin — Staf Print" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@stafprint.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) navigate({ to: "/admin" });
  }, [ready, isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Connexion réussie");
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-hero p-12 text-primary-foreground flex-col justify-between">
        <div className="inline-flex items-center gap-2 font-display text-xl font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ivory text-primary"><Printer className="h-4 w-4" /></span>
          STAF PRINT CENTER
        </div>
        <div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-balance">Pilotez votre studio en un coup d'œil.</h1>
          <p className="mt-4 opacity-90">Tableau de bord centralisé pour services, formations, projets, articles et témoignages.</p>
        </div>
        <div className="text-sm opacity-70">© {new Date().getFullYear()} Staf Print Center</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 font-display text-xl font-bold">STAF PRINT</div>
          <h2 className="font-display text-3xl font-bold">Connexion admin</h2>
          <p className="mt-2 text-sm text-muted-foreground">Utilisez <code className="text-xs bg-muted px-1 rounded">admin@stafprint.com</code> / <code className="text-xs bg-muted px-1 rounded">admin123</code></p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pw">Mot de passe</Label>
              <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
