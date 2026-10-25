import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ECOSYSTEM_SITE_CATEGORY_LABELS, ECOSYSTEM_SITE_STATUS_LABELS, getEcosystemSiteStatusBadge, type APIAdminEcosystemSite, type AdminEcosystemSitePayload, type EcosystemSiteCategory, type EcosystemSiteStatus } from "@/data/ecosystemSites";

interface MetadataSidebarCardProps {
  isEditing: boolean;
  site: APIAdminEcosystemSite;
  form: AdminEcosystemSitePayload;
  onChangeForm: (form: AdminEcosystemSitePayload) => void;
}

export function MetadataSidebarCard({ isEditing, site, form, onChangeForm }: MetadataSidebarCardProps) {
  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo_key">Clé du logo</Label>
            <Input id="logo_key" value={form.logo_key} onChange={(e) => onChangeForm({ ...form, logo_key: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => onChangeForm({ ...form, category: v as EcosystemSiteCategory })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ECOSYSTEM_SITE_CATEGORY_LABELS).map(([k, l]) => (
                  <SelectItem key={k} value={k}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={form.status} onValueChange={(v) => onChangeForm({ ...form, status: v as EcosystemSiteStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="building">En construction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          Métadonnées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-1 border-b text-xs">
          <span className="text-muted-foreground">Clé Logo</span>
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{site.logoKey}</code>
        </div>
        <div className="flex items-center justify-between py-1 border-b text-xs">
          <span className="text-muted-foreground">Catégorie</span>
          <span className="font-medium">{ECOSYSTEM_SITE_CATEGORY_LABELS[site.category]}</span>
        </div>
        <div className="flex items-center justify-between py-1 text-xs">
          <span className="text-muted-foreground">Statut</span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${getEcosystemSiteStatusBadge(site.status)}`}>
            {ECOSYSTEM_SITE_STATUS_LABELS[site.status]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}