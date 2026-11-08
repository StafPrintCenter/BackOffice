import type { ReactNode } from "react";
import { useAuthShellState, AuthShellFormPanel, AuthShellHeroPanel } from "./";

/**
 * Le shell visuel admin : colonne hero à gauche (thème "espace administrateur), formulaire à droite. title/subtitle/footer sont lus depuis le contexte ; children = <Outlet/>.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const { title, subtitle, footer } = useAuthShellState();

  return (
    <div className="bg-grain grid min-h-screen lg:grid-cols-2">
      <AuthShellHeroPanel />
      <AuthShellFormPanel title={title} subtitle={subtitle} footer={footer}>
        {children}
      </AuthShellFormPanel>
    </div>
  );
}
