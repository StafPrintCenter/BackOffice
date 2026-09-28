import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      {
        title: `Mot de passe oublié - Espace Formateur ${SITE.name}`
      },
      { name: "description", content: "Recevez un lien de réinitialisation pour votre compte formateur." },
      { property: "og:title", content: "Mot de passe oublié - Espace Formateur" },
      {
        property: "og:description", content: `Réinitialisez l'accès à votre espace formateur ${SITE.name}.`
      },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
      toast.success("Lien de réinitialisation envoyé.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Indiquez votre e-mail, nous vous envoyons un lien de réinitialisation."
      footer={<Link to="/" className="font-medium text-foreground underline underline-offset-4">Retour à la connexion</Link>}
    >
      {sent ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm">
          <p className="text-muted-foreground">Un lien a été envoyé à <span className="font-medium text-foreground">{email}</span>.</p>
          <Button asChild variant="soft" className="w-full">
            <Link to="/reinitialisation" search={{ token: "demo-token" }}>Ouvrir le lien de démonstration</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Envoi…" : "Envoyer le lien"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
