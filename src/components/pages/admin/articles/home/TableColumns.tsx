import type { Column } from "@/components/site/DataTable";
import type { APIAdminArticleListItem } from "@/data/articles";

export interface CategoryItem {
  id: string;
  name: string;
  colorClass?: string;
}

export function getArticleTableColumns(categories: CategoryItem[]): Column<APIAdminArticleListItem>[] {
  return [
    {
      key: "cover",
      label: "",
      render: (r) => <img src={r.cover} alt="" className="h-10 w-14 rounded object-cover" />,
    },
    {
      key: "title",
      label: "Titre",
      render: (r) => (
        <div className="max-w-45 sm:max-w-xs md:max-w-md">
          <div className="sm:block truncate">
            <div className="font-medium leading-snug">{r.title}</div>
            {r.slug && <span className="font-mono text-xs font-medium text-primary">{r.slug}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Catégorie",
      render: (r) => {
        const match = categories.find(
          (c) => c.id === r.categoryId || c.name.toLowerCase() === (typeof r.category === "string" ? r.category.toLowerCase() : "")
        );

        const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
        const categoryName = typeof r.category === "string" ? r.category : match?.name || "Sans catégorie";

        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {categoryName}
          </span>
        );
      },
    },
    { key: "author", label: "Auteur" },
    { key: "date", label: "Publié", render: (r) => new Date(r.date).toLocaleDateString("fr-FR") },
  ];
}