import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { APICommunityCategory } from "@/data/community";
import { DEFAULT_CATEGORY_COLOR } from "@/data/communityAdmin";
import { useCreateCommunityCategory, useUpdateCommunityCategory } from "@/stores/useCommunityAdminStore";

interface Props { category?: APICommunityCategory; open: boolean; onOpenChange: (v: boolean) => void; nextOrder?: number }

export function CategoryFormDialog({ category, open, onOpenChange, nextOrder = 0 }: Props) {
  const isEdit = !!category;
  const create = useCreateCommunityCategory();
  const update = useUpdateCommunityCategory();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setColor(category?.color ?? DEFAULT_CATEGORY_COLOR);
    setSortOrder(category?.sortOrder ?? nextOrder);
    setIsActive(category?.isActive ?? true);
    setError(null);
  }, [open, category, nextOrder]);

  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (name.trim().length < 2) return setError("Le nom doit contenir au moins 2 caractères.");
    setError(null);
    const payload = { name: name.trim(), description: description.trim(), color, sortOrder, isActive };
    const callbacks = {
      onSuccess: () => { toast.success(isEdit ? "Catégorie modifiée" : "Catégorie créée"); onOpenChange(false); },
      onError: (e: Error) => setError(e.message),
    };
    if (isEdit && category) update.mutate({ id: category.id, payload }, callbacks);
    else create.mutate(payload, callbacks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          <DialogDescription>Une catégorie inactive n'est plus proposée à la publication.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Couleur</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-md border bg-background p-1" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div><Label>Ordre d'affichage</Label><Input type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} /></div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label className="cursor-pointer">Catégorie active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}