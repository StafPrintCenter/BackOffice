import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSessionsList } from "@/stores/useTrainingSessionsStore";
import { EMPTY_SESSION_FILTERS, SessionsFilters, type SessionsFiltersValue } from "./SessionsFilters";
import { Pager } from "./Pager";
import { SessionCard } from "./SessionCard";

export function SessionsTab({ trainingId }: { trainingId?: string }) {
  const [filters, setFilters] = useState<SessionsFiltersValue>(EMPTY_SESSION_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const { sessions, meta, isLoading, isError } = useSessionsList({ ...filters, query: debouncedQuery, trainingId, page, perPage: 12 });

  return (
    <>
      <SessionsFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Impossible de charger les sessions.
        </p>
      ) : sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Aucune session ne correspond.
        </p>
      ) : (
        <div className="max-w-4xl space-y-3">
          {sessions.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      )
      }

      {meta &&
        <Pager
          page={meta.currentPage}
          lastPage={meta.lastPage}
          total={meta.total}
          onChange={setPage}
        />
      }
    </>
  );
}