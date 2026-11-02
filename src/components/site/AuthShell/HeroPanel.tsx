import { SITE } from "@/data/site";
import logo from "@/assets/logos.json";
import { SocialLinks } from "@/components/site/SocialLinks";

export function AuthShellHeroPanel() {
  return (
    <div className="hidden flex-col justify-between bg-gradient-hero p-12 text-primary-foreground lg:flex">
      <div className="flex items-center">
        <img src={logo.dc} alt="Logo SPC" className="h-10 w-auto md:h-12" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em]">{SITE.tool}</p>
        <h1 className="mt-3 font-display text-balance text-5xl font-bold tracking-tight">
          Pilotez votre studio en un coup d'œil.
        </h1>
        <p className="mt-4 opacity-90">
          Tableau de bord centralisé pour services, formations, projets, articles et témoignages.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-6">
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {SITE.name} - Tous droits réservés.
        </p>
        <SocialLinks linkClassName="hover:bg-primary-foreground/10 text-primary-foreground/70 hover:text-primary-foreground" />
      </div>
    </div>
  );
}
