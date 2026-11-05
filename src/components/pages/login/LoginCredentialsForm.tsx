import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PasswordField } from "@/components/site/PasswordField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginCredentialsFormProps {
  defaultEmail: string;
  loading: boolean;
  onSubmit: (email: string, password: string) => void;
}

export function LoginCredentialsForm({
  defaultEmail,
  loading,
  onSubmit,
}: LoginCredentialsFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          type="email"
          className="bg-card"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@votreadresse.com"
          autoComplete="email"
          disabled={loading}
          required
        />
      </div>

      <div>
        <PasswordField
          id="password"
          label="Mot de passe"
          labelAction={
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mot de passe oublié ?
            </Link>
          }
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
    </form>
  );
}
