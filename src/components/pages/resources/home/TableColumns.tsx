import { FileText } from "lucide-react";
import type { Column } from "@/components/site/DataTable";
import type { APIAdminResourceListItem } from "@/data/resources";

function formatPrice(price: number): string {
  return `${price.toLocaleString("fr-FR")} FCFA`;
}

export function getResourceTableColumns(): Column<APIAdminResourceListItem>[] {
  return [
    {
      key: "file",
      label: "",
      render: () => (
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </span>
      ),
    },
    {
      key: "title",
      label: "Ressource",
      render: (resource) => (
        <div className="max-w-45 sm:max-w-xs md:max-w-md">
          <div className="truncate font-medium leading-snug">{resource.title}</div>
          <span className="font-mono text-xs text-primary">{resource.slug}</span>
        </div>
      ),
    },
    { key: "category", label: "Catégorie" },
    { key: "price", label: "Prix", render: (resource) => formatPrice(resource.price) },
    {
      key: "isActive",
      label: "Visibilité",
      render: (resource) => (
        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${resource.isActive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-muted bg-muted text-muted-foreground"}`}>
          {resource.isActive ? "Visible" : "Masquée"}
        </span>
      ),
    },
  ];
}
