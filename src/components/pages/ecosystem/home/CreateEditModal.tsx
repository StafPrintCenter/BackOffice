import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ECOSYSTEM_SITE_CATEGORY_LABELS, type EcosystemSiteCategory, type EcosystemSiteStatus } from "@/data/ecosystemSites";

export const ecosystemSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères").max(120),
  description: z.string().trim().min(2, "La description est requise"),
  url: z.string().trim().url("L'URL doit être valide"),
  logo_key: z.string().trim().min(1, "La clé du logo est requise"),
  category: z.enum(["principal", "outil", "formation", "communication", "divertissement"]),
  status: z.enum(["available", "building"]),
});

export type EcosystemFormValues = z.infer<typeof ecosystemSchema>;

interface CreateEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: EcosystemFormValues;
  onChangeForm: (form: EcosystemFormValues) => void;
  errors: Record<string, string>;
  isEditing: boolean;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateEditModal({ open, onOpenChange, form, onChangeForm, errors, isEditing, onSubmit, isPending }: CreateEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le site" : "Ajouter un site"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={form.name} onChange={(e) => onChangeForm({ ...form, name: e.target.value })} placeholder="Ex: STAF AI" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => onChangeForm({ ...form, description: e.target.value })} placeholder="Description détaillée..." />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={form.url} onChange={(e) => onChangeForm({ ...form, url: e.target.value })} placeholder="https://..." />
            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
          </div>
          <div className="space-y-2">
            <Label>Clé du logo</Label>
            <Input value={form.logo_key} onChange={(e) => onChangeForm({ ...form, logo_key: e.target.value })} placeholder="ex: ai, docs, meet..." />
            {errors.logo_key && <p className="text-xs text-destructive">{errors.logo_key}</p>}
            <p className="text-[11px] text-muted-foreground">
              Doit correspondre à un fichier existant dans le dépôt de logos (ex: AI-MC.png).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={(v) => onChangeForm({ ...form, category: v as EcosystemSiteCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ECOSYSTEM_SITE_CATEGORY_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => onChangeForm({ ...form, status: v as EcosystemSiteStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="building">En construction</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={isPending}>
            {isEditing ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}