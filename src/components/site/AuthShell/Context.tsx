import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthShellContent {
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

interface AuthShellContextValue {
  content: AuthShellContent;
  setContent: (content: AuthShellContent) => void;
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
  const context = useContext(AuthShellContext);
  if (!context) {
    throw new Error(
      "useAuthShellContent doit être utilisé sous une route _auth (AuthShellProvider manquant).",
    );
  }

  useEffect(() => {
    context.setContent(content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.title, content.subtitle, content.footer]);
}

export function useAuthShellState() {
  const context = useContext(AuthShellContext);
  if (!context) {
    throw new Error("AuthShell doit être utilisé sous AuthShellProvider (_auth.tsx).");
  }

  return context.content;
}
