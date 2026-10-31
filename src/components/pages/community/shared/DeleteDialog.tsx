import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { APIPost } from "@/data/community";
import { useDeletePost } from "@/stores/useCommunityStore";

interface Props {
  post: APIPost;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDeleted?: () => void;
}

export function DeletePostDialog({ post, open, onOpenChange, onDeleted }: Props) {
  const [reason, setReason] = useState("");
  const del = useDeletePost();

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setReason(""); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Supprimer la publication</DialogTitle>
          <DialogDescription>« {post.title} » sera supprimée définitivement.</DialogDescription>
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
            onClick={() => del.mutate({ id: post.id, reason: reason.trim() || undefined }, {
              onSuccess: () => { toast.success("Publication supprimée"); onOpenChange(false); onDeleted?.(); },
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