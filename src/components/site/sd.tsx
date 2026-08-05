import type { ReactNode } from "react";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

interface AdminAuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AdminAuthShell({
  title,
  subtitle,
  children,
  footer,
}: AdminAuthShellProps) {
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