import type { APIAdminCategory } from "@/data/categories";

export const categoryTableColumns = [
  {
    key: "slug",
    label: "Slug",
    render: (r: APIAdminCategory) => (
      <span className="font-mono text-xs font-medium text-primary">{r.slug}</span>
    ),
  },
  {
    key: "name",
    label: "Nom",
    render: (r: APIAdminCategory) => <span className="font-medium">{r.name}</span>,
  },
  {
    key: "colorClass",
    label: "Couleur",
    render: (r: APIAdminCategory) => (
      <span
        className={`inline-flex px-2 py-1 rounded text-xs font-medium ${r.colorClass || "bg-slate-100 text-slate-700"
          }`}
      >
        {r.name}
      </span>
    ),
  },
  {
    key: "flags",
    label: "Type",
    render: (r: APIAdminCategory) => (
      <div className="flex flex-wrap gap-1 text-[10px] font-medium">
        {r.isTrainingTheme && (
          <span className="rounded bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5">
            Formation
          </span>
        )}
        {r.isProjectCategory && (
          <span className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5">
            Projet
          </span>
        )}
        {r.isArticleCategory && (
          <span className="rounded bg-sky-500/10 text-sky-600 px-1.5 py-0.5">
            Article
          </span>
        )}
        {r.isNewsletterCategory && (
          <span className="rounded bg-amber-500/10 text-amber-600 px-1.5 py-0.5">
            Newsletter
          </span>
        )}
      </div>
    ),
  },
];