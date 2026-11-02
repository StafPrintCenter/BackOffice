import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCommunityCategories, usePostsList } from "@/stores/useCommunityStore";
import { Pager } from "@/components/trainings/sessions/Pager";
import {
  EMPTY_POST_FILTERS, PostFilters, type PostFiltersValue,
  PostCard
} from "./";

export function CommunityFeed() {
  const [filters, setFilters] = useState<PostFiltersValue>(EMPTY_POST_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const { includeInactive, ...postFilters } = filters;
  const { categories } = useCommunityCategories({ includeInactive });
  const { posts, meta, isLoading, isError } = usePostsList({ ...postFilters, query: debouncedQuery, page, perPage: 12 });

  return (
    <>
      <div className="mb-6">
        <PostFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} categories={categories} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
      ) : isError ? (
        <p className="text-sm text-destructive">Impossible de charger les publications.</p>
      ) : posts.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">Aucune publication ne correspond.</p>
      ) : (
        <div className="max-w-3xl space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
      )}

      {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} total={meta.total} onChange={setPage} />}
    </>
  );
}