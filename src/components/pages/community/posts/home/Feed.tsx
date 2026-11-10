import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCommunityCategories, usePostsList } from "@/stores/useCommunityStore";
import { Pager } from "@/components/pages/trainings/sessions/Pager";
import {
  EMPTY_POST_FILTERS, PostFilters, type PostFiltersValue,
  PostCard
} from ".";

export function CommunityFeed() {
  const [filters, setFilters] = useState<PostFiltersValue>(EMPTY_POST_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const { includeInactive, ...postFilters } = filters;
  const { categories } = useCommunityCategories({ includeInactive });
  const { posts, meta, isLoading, isError } = usePostsList({ ...postFilters, query: debouncedQuery, page, perPage: 12 });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section className="min-w-0 space-y-4">
        {meta && (
          <p className="text-xs text-muted-foreground">
            {meta.total} publication{meta.total > 1 ? "s" : ""}
          </p>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les publications.</p>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Aucune publication ne correspond.</p>
        ) : (
          <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}

        {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} total={meta.total} onChange={setPage} />}
      </section>
      <aside className="rounded-2xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Filtres</h2>
        <PostFilters
          value={filters}
          onChange={(value) => { setFilters(value); setPage(1); }}
          categories={categories}
          compact
        />
      </aside>
    </div>
  );
}