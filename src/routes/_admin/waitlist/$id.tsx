import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail, Calendar, Layers, Copy, Check, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminWaitlistDetail } from "@/stores/useWaitlistStore";
import { getWaitlistPlatformBadge, getWaitlistPlatformLabel } from "@/data/waitlist";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/waitlist/$id")({
  head: () => ({
    meta: [
      { title: `Inscription liste d'attente | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WaitlistEntryDetail,
});

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function WaitlistEntryDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: entry, isLoading } = useAdminWaitlistDetail(id);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!entry?.email) return;
    try {
      await navigator.clipboard.writeText(entry.email);
      setCopied(true);
      toast.success("Email copié dans le presse-papier");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier l'email");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/waitlist" })}>
          <ArrowLeft className="mr-1 size-4" /> Retour à la liste
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="mb-2 size-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Chargement des détails...</p>
        </div>
      ) : !entry ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground/60" />
          <h2 className="mt-3 text-lg font-semibold">Inscription introuvable</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            L'entrée demandée n'existe pas ou a été supprimée.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ to: "/waitlist" })}>
            Retourner aux inscriptions
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Colonne Principale (2 colonnes sur desktop) */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Candidat / Prospect
                  </span>
                  <h1 className="mt-1 break-all font-display text-2xl font-bold tracking-tight">
                    {entry.email}
                  </h1>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getWaitlistPlatformBadge(
                    entry.platformName
                  )}`}
                >
                  {getWaitlistPlatformLabel(entry.platformName)}
                </span>
              </div>

              {/* Actions rapides */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-6">
                <Button asChild variant="default" size="sm">
                  <a href={`mailto:${entry.email}`}>
                    <Mail className="mr-1.5 size-4" /> Contacter par email
                  </a>
                </Button>

                <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                  {copied ? (
                    <Check className="mr-1.5 size-4 text-emerald-500" />
                  ) : (
                    <Copy className="mr-1.5 size-4" />
                  )}
                  {copied ? "Email copié" : "Copier l'email"}
                </Button>
              </div>
            </div>

            {/* Fiche d'information détaillée */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold text-foreground">Coordonnées</h3>
              <dl className="mt-4 divide-y divide-border text-sm">
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Adresse Email</dt>
                  <dd className="font-medium text-foreground">{entry.email}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Identifiant Unique</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{id}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Colonne Secondaire (1 colonne sur desktop) */}
          <div className="space-y-6">
            {/* Carte Plateforme */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Layers className="size-4 text-primary" /> Plateforme demandée
              </div>

              <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Espace
                </div>
                <div className="mt-1 font-semibold text-foreground">
                  {getWaitlistPlatformLabel(entry.platformName)}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  Code: {entry.platformName}
                </div>
              </div>
            </div>

            {/* Carte Historique & Audit */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="size-4 text-primary" /> Horodatage
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="block font-medium text-foreground">Date d'inscription</span>
                    <span className="text-muted-foreground">{formatDate(entry.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t pt-3">
                  <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <span className="block font-medium text-foreground">Dernière mise à jour</span>
                    <span className="text-muted-foreground">{formatDate(entry.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
