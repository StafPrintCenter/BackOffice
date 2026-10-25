import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/categories";

const schema = z.object({
  name: z.string().trim().min(2, "Le nom doit faire au moins 2 caractères").max(50),
  slug: z.string().trim().max(50).optional(),
  colorClass: z.string().trim().min(1, "La classe couleur est requise").max(80),
  isTrainingTheme: z.boolean(),
  isProjectCategory: z.boolean(),
  isArticleCategory: z.boolean(),
  isNewsletterCategory: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "",
  slug: "",
  colorClass: "bg-slate-100 text-slate-700",
  isTrainingTheme: false,
  isProjectCategory: false,
  isArticleCategory: false,
  isNewsletterCategory: false,
};

interface CategoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: APIAdminCategory;
  onSubmit: (payload: AdminCategoryPayload) => void;
  isPending: boolean;
}

export function CategoryCreateModal({
  open,
  onOpenChange,
  category,
  onSubmit,
  isPending,
}: CategoryCreateModalProps) {
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        slug: category.slug ?? "",
        colorClass: category.colorClass ?? "bg-slate-100 text-slate-700",
        isTrainingTheme: !!category.isTrainingTheme,
        isProjectCategory: !!category.isProjectCategory,
        isArticleCategory: !!category.isArticleCategory,
        isNewsletterCategory: !!category.isNewsletterCategory,
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [category, open]);

  const handleSubmit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }

    const payload: AdminCategoryPayload = {
      name: parsed.data.name,
      slug: parsed.data.slug,
      color_class: parsed.data.colorClass,
      is_training_theme: parsed.data.isTrainingTheme,
      is_project_category: parsed.data.isProjectCategory,
      is_article_category: parsed.data.isArticleCategory,
      is_newsletter_category: parsed.data.isNewsletterCategory,
    } as unknown as AdminCategoryPayload;

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <Label>Nom</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label>Slug (optionnel)</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <Label>Classe couleur (Tailwind)</Label>
            <Input
              value={form.colorClass}
              onChange={(e) => setForm({ ...form, colorClass: e.target.value })}
              placeholder="ex: bg-indigo-500/10 text-indigo-600"
            />
            {errors.colorClass && (
              <p className="mt-1 text-xs text-destructive">{errors.colorClass}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Thème de formation</Label>
              <Switch
                checked={form.isTrainingTheme}
                onCheckedChange={(v) => setForm({ ...form, isTrainingTheme: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Catégorie de projet</Label>
              <Switch
                checked={form.isProjectCategory}
                onCheckedChange={(v) => setForm({ ...form, isProjectCategory: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Catégorie d'article</Label>
              <Switch
                checked={form.isArticleCategory}
                onCheckedChange={(v) => setForm({ ...form, isArticleCategory: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Catégorie de newsletter</Label>
              <Switch
                checked={form.isNewsletterCategory}
                onCheckedChange={(v) => setForm({ ...form, isNewsletterCategory: v })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {category ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}