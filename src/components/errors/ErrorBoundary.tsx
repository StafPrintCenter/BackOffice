import { useRouter, Link } from "@tanstack/react-router";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useEffect } from "react";
import { reportError } from "@/lib/error/reporting";

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-12 overflow-hidden bg-grain">
      {/* Decorative shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-destructive/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground font-display">
                Une erreur est survenue
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Le rendu de cette page du backoffice a rencontré un obstacle technique.
              </p>
            </div>
          </div>

          {/* Details (Visual error output) */}
          <div className="my-6 rounded-2xl bg-muted p-4 border border-border/50 max-h-40 overflow-y-auto font-mono text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-1">{error?.name || "Error"}</p>
            <p className="whitespace-pre-wrap">{error?.message || "Erreur inconnue."}</p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-card px-5 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}