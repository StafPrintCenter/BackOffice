import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_META, NOTIFICATION_CATEGORIES, type NotificationCategory } from "@/data/notifications";
import { useBulkDeleteNotifications } from "@/stores/useNotificationsStore";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultCategory?: NotificationCategory | "";
  onDone?: () => void;
}

export function DeleteAllDialog({ open, onOpenChange, defaultCategory = "", onDone }: Props) {
  const [category, setCategory] = useState<NotificationCategory | "">(defaultCategory);
  const [readOnly, setReadOnly] = useState(true);
  const bulk = useBulkDeleteNotifications();

  const confirm = () =>
    bulk.mutate(
      { scope: "all", category, readOnly },
      {
        onSuccess: ({ message, deleted }) => { toast.success(message, { description: `${deleted} supprimée(s)` }); onOpenChange(false); onDone?.(); },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Supprimer en masse</DialogTitle>
          <DialogDescription>Action définitive, sur toutes les pages (pas seulement celle affichée).</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Catégorie</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NotificationCategory | "")}
              className="mt-1 h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Toutes les catégories</option>
              {NOTIFICATION_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
            Uniquement les notifications déjà lues
          </label>
          {!readOnly && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Les notifications non lues seront aussi supprimées.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={confirm} disabled={bulk.isPending}>
            {bulk.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Tout supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}