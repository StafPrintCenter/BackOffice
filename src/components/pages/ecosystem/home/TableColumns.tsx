import { ECOSYSTEM_SITE_CATEGORY_LABELS, ECOSYSTEM_SITE_STATUS_LABELS, getEcosystemSiteStatusBadge, type APIAdminEcosystemSite } from "@/data/ecosystemSites";

export function getEcosystemTableColumns() {
  return [
    {
      key: "name",
      label: "Site",
      render: (r: APIAdminEcosystemSite) => (
        <div className="flex items-center gap-3">
          <img src={r.logoUrl} alt="" className="h-8 w-8 rounded-lg border bg-muted/20 object-contain p-1 shrink-0" />
          <div className="min-w-0">
            <div className="font-medium truncate">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate">{r.url}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (r: APIAdminEcosystemSite) => (
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
          {ECOSYSTEM_SITE_CATEGORY_LABELS[r.category]}
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (r: APIAdminEcosystemSite) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${getEcosystemSiteStatusBadge(r.status)}`}>
          {ECOSYSTEM_SITE_STATUS_LABELS[r.status]}
        </span>
      ),
    },
  ];
}