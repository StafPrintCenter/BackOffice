import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

interface AuthShellContent {
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

interface AuthShellContextValue {
  content: AuthShellContent;
  setContent: (c: AuthShellContent) => void;
}

const AuthShellContext = createContext<AuthShellContextValue | null>(null);

/**
 * À placer dans _auth.tsx, autour du <AuthShell>. Fournit le contexte que chaque page _auth/* alimente via useAuthShellContent().
 */
export function AuthShellProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<AuthShellContent>({ title: "", subtitle: "" });
  return (
    <AuthShellContext.Provider value={{ content, setContent }}>
      {children}
    </AuthShellContext.Provider>
  );
}

/**
 * À appeler en haut de chaque page _auth/* (login, invite, etc.) pour définir le titre/sous-titre/footer affichés par le AuthShell englobant.
 * Se met à jour automatiquement à chaque changement d'état de la page (ex: invite.tsx qui passe par plusieurs écrans).
 */
export function useAuthShellContent(content: AuthShellContent) {
  const ctx = useContext(AuthShellContext);
  if (!ctx) {
    throw new Error("useAuthShellContent doit être utilisé sous une route _auth (AuthShellProvider manquant).");
  }

  useEffect(() => {
    ctx.setContent(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.title, content.subtitle, content.footer]);
}

/**
 * Le shell visuel : colonne hero à gauche, formulaire à droite.
 * title/subtitle/footer sont lus depuis le contexte ; children = <Outlet/>.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const ctx = useContext(AuthShellContext);
  if (!ctx) {
    throw new Error("AuthShell doit être utilisé sous AuthShellProvider (_auth.tsx).");
  }
  const { title, subtitle, footer } = ctx.content;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Colonne gauche (Desktop) */}
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

      {/* Colonne droite / Formulaire */}
      <div className="flex items-center justify-center p-8 bg-grain">
        <div className="w-full max-w-md">
          {/* Logo affiché en haut sur mobile & petits écrans */}
          <div className="lg:hidden mb-8 flex justify-center">
            <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}