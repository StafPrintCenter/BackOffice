import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminResource } from "@/data/resources";

export function ResourceSettingsSidebarCard({
  resource,
  fileUrl,
  onPreview,
}: {
  resource: APIAdminResource;
  fileUrl: string | null;
  onPreview: () => void;
}) {
  return (
    <aside className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Fichier associé</h2>
        <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </span>
          <p className="min-w-0 break-all text-sm font-medium">{resource.downloadFileName || "Fichier de la ressource"}</p>
        </div>
        {fileUrl && (
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onPreview}>
              <Eye className="mr-1.5 h-4 w-4" /> Aperçu
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="Télécharger le fichier">
              <a href={fileUrl} download={resource.downloadFileName || undefined}><Download className="h-4 w-4" /></a>
            </Button>
          </div>
        )}
        {!fileUrl && <p className="mt-3 text-xs text-muted-foreground">Aucun lien de fichier disponible.</p>}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Paramètres</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Catégorie</dt><dd className="font-medium">{resource.category}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Prix</dt><dd className="font-medium">{resource.price.toLocaleString("fr-FR")} FCFA</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Ancien prix</dt><dd className="font-medium">{resource.originalPrice == null ? "-" : `${resource.originalPrice.toLocaleString("fr-FR")} FCFA`}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Remise</dt><dd className="font-medium">{resource.discountPercentage.toLocaleString("fr-FR")} %</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Format</dt><dd className="text-right font-medium">{resource.format || "-"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Indication</dt><dd className="text-right font-medium">{resource.meta || "-"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Statut</dt><dd className="text-right font-medium">{resource.status || "-"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Visibilité</dt><dd className="font-medium">{resource.isActive ? "Visible" : "Masquée"}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Consultations</dt><dd className="font-medium">{resource.viewsCount}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Téléchargements</dt><dd className="font-medium">{resource.downloadsCount}</dd></div>
        </dl>
      </section>
    </aside>
  );
}
