import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { RichTextEditor } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateAdminArticle } from "@/stores";
import type { AdminArticlePayload } from "@/data/articles";

const schema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(150),
  slug: z.string().trim().max(150).optional(),
  body: z.string().trim().min(10, "Contenu trop court"),
  excerpt: z.string().trim().min(2, "Extrait trop court").max(300),
  author: z.string().trim().min(1, "Auteur requis").max(80),
  category_id: z.string().trim().min(1, "Choisissez une catégorie"),
  cover: z.string().trim().url("URL d'image invalide"),
  published_at: z.string().trim().min(1, "Date requise"),
});

type FormValues = z.infer<typeof schema>;

const emptyForm: FormValues = {
  title: "",
  slug: "",
  body: "",
  excerpt: "",
  author: "",
  category_id: "",
  cover: "",
  published_at: new Date().toISOString().slice(0, 10),
};

interface ArticleCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Array<{ id: string; name: string }>;
}

export function ArticleCreateModal({ open, onOpenChange, categories }: ArticleCreateModalProps) {
  const createMutation = useCreateAdminArticle();
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = (v: boolean) => {
    if (v) {
      setForm(emptyForm);
      setErrors({});
    }
    onOpenChange(v);
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminArticlePayload, {
      onSuccess: () => {
        toast.success("Article créé");
        onOpenChange(false);
      },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvel article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label>Slug (optionnel - auto-généré sinon)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">- Choisir -</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
            </div>
            <div>
              <Label>Auteur</Label>
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              {errors.author && <p className="text-xs text-destructive mt-1">{errors.author}</p>}
            </div>
            <div>
              <Label>Image de couverture (URL)</Label>
              <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} />
              {errors.cover && <p className="text-xs text-destructive mt-1">{errors.cover}</p>}
            </div>
            <div>
              <Label>Date de publication</Label>
              <Input
                type="date"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Extrait</Label>
            <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            {errors.excerpt && <p className="text-xs text-destructive mt-1">{errors.excerpt}</p>}
          </div>
          <div>
            <Label>Contenu</Label>
            <RichTextEditor
              value={form.body}
              onChange={(html) => setForm({ ...form, body: html })}
              placeholder="Rédigez votre article..."
            />
            {errors.body && <p className="text-xs text-destructive mt-1">{errors.body}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}