import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { APIComment } from "@/data/community";
import { useDeleteComment } from "@/stores/useCommunityStore";

interface Props { comment: APIComment; open: boolean; onOpenChange: (v: boolean) => void }

export function DeleteCommentDialog({ comment, open, onOpenChange }: Props) {
  const [reason, setReason] = useState("");
  const del = useDeleteComment();

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setReason(""); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Supprimer le commentaire</DialogTitle>
          <DialogDescription>
            Action définitive.{comment.repliesCount > 0 && ` Ses ${comment.repliesCount} réponse(s) seront supprimées avec lui.`}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Motif (optionnel)</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button
            variant="destructive"
            disabled={del.isPending}
            onClick={() => del.mutate({ id: comment.id, reason: reason.trim() || undefined }, {
              onSuccess: () => { toast.success("Commentaire supprimé"); onOpenChange(false); },
              onError: (e) => toast.error(e.message),
            })}
          >
            {del.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}