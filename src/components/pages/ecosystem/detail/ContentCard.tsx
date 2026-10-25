import { ExternalLink, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ECOSYSTEM_SITE_CATEGORY_LABELS, ECOSYSTEM_SITE_STATUS_LABELS, getEcosystemSiteStatusBadge, type APIAdminEcosystemSite, type AdminEcosystemSitePayload } from "@/data/ecosystemSites";

interface ContentCardProps {
  isEditing: boolean;
  site: APIAdminEcosystemSite;
  form: AdminEcosystemSitePayload;
  onChangeForm: (form: AdminEcosystemSitePayload) => void;
}

export function ContentCard({ isEditing, site, form, onChangeForm }: ContentCardProps) {
  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations Générales</CardTitle>
          <CardDescription>Modifiez les détails affichés sur l'écosystème</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du site</Label>
            <Input id="name" value={form.name} onChange={(e) => onChangeForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL cible</Label>
            <Input id="url" value={form.url} onChange={(e) => onChangeForm({ ...form, url: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} value={form.description} onChange={(e) => onChangeForm({ ...form, description: e.target.value })} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <img src={site.logoUrl} alt={site.name} className="h-20 w-20 rounded-xl border bg-muted/20 object-contain p-3 shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold">
                {ECOSYSTEM_SITE_CATEGORY_LABELS[site.category]}
              </span>
              <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getEcosystemSiteStatusBadge(site.status)}`}>
                {ECOSYSTEM_SITE_STATUS_LABELS[site.status]}
              </span>
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
            >
              <Globe className="h-4 w-4 shrink-0" />
              {site.url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">À propos</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{site.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}