import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Home, ArrowLeft } from "lucide-react";

export function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12 overflow-hidden bg-grain">
      {/* Decorative Brand Shapes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Abstract Graphic */}
        <div className="relative mx-auto w-24 h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-primary/10 rotate-6 transition-transform hover:rotate-12 duration-300" />
          <div className="absolute inset-0 rounded-3xl bg-accent/20 -rotate-6 transition-transform hover:-rotate-12 duration-300" />
          <div className="relative rounded-3xl bg-card border border-border w-20 h-20 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="text-8xl font-bold tracking-tight text-foreground font-display select-none">
          4<span className="text-primary text-gradient-brand">0</span>4
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-foreground font-display">
          Page introuvable
        </h2>

        <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          Cette section du backoffice n'existe pas, a été déplacée ou vos droits d'accès ne la couvrent pas.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-muted hover:border-border hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}