import { CATEGORY_META, NOTIFICATION_CATEGORIES, type NotificationCategory } from "@/data/notifications";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface NotificationsFilterBarProps {
  category: NotificationCategory | "all";
  setCategory: (c: NotificationCategory | "all") => void;
  unreadOnly: boolean;
  setUnreadOnly: (v: boolean) => void;
  allVisibleSelected: boolean;
  toggleAllVisible: () => void;
  hasFilteredItems: boolean;
  selectedCount: number;
  onDeleteSelected: () => void;
}

export function NotificationsFilterBar({
  category,
  setCategory,
  unreadOnly,
  setUnreadOnly,
  allVisibleSelected,
  toggleAllVisible,
  hasFilteredItems,
  selectedCount,
  onDeleteSelected,
}: NotificationsFilterBarProps) {
  return (
    <div className="rounded-xl border bg-card p-3 sm:p-4 shadow-xs space-y-3">
      {/* Catégories sous forme de puces scrollables */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(["all", ...NOTIFICATION_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`cursor-pointer shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${category === c
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
          >
            {c === "all" ? "Toutes les catégories" : CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      {/* Checkboxes et Actions groupées */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <label className="flex cursor-pointer items-center gap-2 font-medium text-foreground hover:opacity-80">
            <input
              type="checkbox"
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            Non lues uniquement
          </label>

          {hasFilteredItems && (
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
              />
              Tout sélectionner
            </label>
          )}
        </div>

        {selectedCount > 0 && (
          <Button size="sm" variant="destructive" onClick={onDeleteSelected} className="h-7 text-xs w-full sm:w-auto">
            <Trash2 className="mr-1 h-3 w-3" /> Supprimer la sélection ({selectedCount})
          </Button>
        )}
      </div>
    </div>
  );
}