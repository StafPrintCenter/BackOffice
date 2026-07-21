import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/States";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  onCreate,
  onView,
  onEdit,
  onDelete,
  createLabel = "Nouveau",
  isLoading,
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  onCreate?: () => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  createLabel?: string;
  isLoading?: boolean;
}) {

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    if (!q) return data;
    const needle = q.toLowerCase();
    return data.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(needle)));
  }, [data, q, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, pages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        {onCreate && (
          <Button onClick={onCreate}><Plus className="mr-1 h-4 w-4" /> {createLabel}</Button>
        )}
      </div>

      <div className="mt-4 rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Chargement...</div>
        ) : paged.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Aucun résultat" description={q ? "Essayez une autre recherche." : "Créez votre premier élément."} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {columns.map((c) => <th key={String(c.key)} className="px-4 py-3 text-left font-semibold">{c.label}</th>)}
                  {(onView || onEdit || onDelete) && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
                </tr>
              </thead>

              <tbody>
                {paged.map((row) => (
                  <tr
                    key={row.id}
                    className={"border-t hover:bg-muted/30 " + (onView ? "cursor-pointer" : "")}
                    onClick={onView ? () => onView(row) : undefined}
                  >
                    {columns.map((c) => (
                      <td key={String(c.key)} className="px-4 py-3 align-middle">
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key as string] ?? "")}
                      </td>
                    ))}

                    {(onView || onEdit || onDelete) && (
                      <td
                        className="px-4 py-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}>
                        {
                          onView &&
                          <button
                            onClick={() => onView(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent cursor-pointer" aria-label="Voir"
                            title="Consulter"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        }
                        {
                          onEdit &&
                          <button
                            onClick={() => onEdit(row)}
                            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        }
                        {
                          onDelete &&
                          <button
                            onClick={() => onDelete(row)}
                            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label="Supprimer"
                            title="Suppprimer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        }
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">{filtered.length} résultats · Page {currentPage} / {pages}</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>Précédent</Button>
            <Button variant="outline" size="sm" disabled={currentPage === pages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
          </div>
        </div>
      )}
    </div>
  );
}
