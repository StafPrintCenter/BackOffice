import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/pages/notifications";
import type { APINotificationListItem } from "@/data/notifications";

interface NotificationsListProps {
  isLoading: boolean;
  filtered: APINotificationListItem[];
  selected: string[];
  toggleSelect: (id: string) => void;
  onItemClick: (id: string) => void;
  meta: { currentPage: number; lastPage: number } | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function NotificationsList({
  isLoading,
  filtered,
  selected,
  toggleSelect,
  onItemClick,
  meta,
  page,
  setPage,
}: NotificationsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Chargement des notifications…</span>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 py-20 text-center text-sm text-muted-foreground space-y-2">
        <Filter className="mx-auto h-8 w-8 text-muted-foreground/40" />
        <p>Aucune notification ne correspond aux filtres sélectionnés.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filtered.map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          selectable
          selected={selected.includes(n.id)}
          onToggleSelect={toggleSelect}
          onClick={() => onItemClick(n.id)}
        />
      ))}

      {meta && meta.lastPage > 1 && (
        <div className="flex items-center justify-between pt-4 text-sm border-t mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-muted-foreground text-xs font-medium">
            Page {meta.currentPage} sur {meta.lastPage}
          </span>
          <Button variant="outline" size="sm" disabled={page >= meta.lastPage} onClick={() => setPage((p) => p + 1)}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}