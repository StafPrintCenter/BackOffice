import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SITE } from "@/data/site";
import logo from "@/assets/logos.json";
import { SocialLinks } from "@/components/site/SocialLinks";

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
 * À appeler en haut de chaque page _auth/* (login, invite, etc.) pour définir le titre/sous-titre/footer affichés par le AuthShell englobant. Se met à jour automatiquement à chaque changement d'état de la page.
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
 * Le shell visuel admin : colonne hero à gauche (thème "espace administrateur), formulaire à droite. title/subtitle/footer sont lus depuis le contexte ; children = <Outlet/>.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const ctx = useContext(AuthShellContext);
  if (!ctx) {
    throw new Error("AuthShell doit être utilisé sous AuthShellProvider (_auth.tsx).");
  }
  const { title, subtitle, footer } = ctx.content;

  return (
    <div className="bg-grain grid min-h-screen lg:grid-cols-2">
      {/* Colonne gauche (Desktop) */}
      <div className="hidden lg:flex bg-gradient-hero p-12 text-primary-foreground flex-col justify-between">
        <div className="flex items-center">
          <img src={logo.dc} alt="Logo SPC" className="h-10 md:h-12 w-auto" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em]">{SITE.tool}</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-balance">
            Pilotez votre studio en un coup d'œil.
          </h1>
          <p className="mt-4 opacity-90">
            Tableau de bord centralisé pour services, formations, projets, articles et témoignages.
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-primary-foreground/10">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {SITE.name} - Tous droits réservés.
          </p>
          <SocialLinks linkClassName="hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground" />
        </div>
      </div>

      {/* Colonne droite / Formulaire */}
      <div className="flex flex-col justify-between p-8 bg-grain">
        <div className="flex-1 flex items-center justify-center">
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

        {/* Réseaux sociaux affichés en bas sur écran mobile */}
        <div className="lg:hidden pt-8 mt-auto border-t border-border flex flex-col items-center gap-3">
          <SocialLinks />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}
          </p>
        </div>
      </div>
    </div>
  );
}
