import { Tag, User, Calendar, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminArticlePayload } from "@/data/articles";

interface CategoryItem {
  id: string;
  name: string;
  colorClass?: string;
}

interface ArticleSettingsSidebarCardProps {
  isEditing: boolean;
  article: { categoryId: string; category?: string; author?: string; date: string; slug: string };
  form: AdminArticlePayload;
  onChangeForm: (form: AdminArticlePayload) => void;
  categories: CategoryItem[];
}

export function ArticleSettingsSidebarCard({
  isEditing,
  article,
  form,
  onChangeForm,
  categories,
}: ArticleSettingsSidebarCardProps) {
  const selectedCatId = isEditing ? form.category_id : article.categoryId;
  const match = categories.find(
    (c) =>
      c.id === selectedCatId ||
      c.name.toLowerCase() === (typeof article.category === "string" ? article.category.toLowerCase() : "")
  );

  const categoryColorClass = match?.colorClass || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const categoryName = match?.name || (typeof article.category === "string" ? article.category : "Sans catégorie");

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <Tag className="h-4 w-4 text-primary shrink-0" />
        <h3 className="font-display text-sm font-semibold">Paramètres de publication</h3>
      </div>

      <div className="space-y-4 text-sm">
        {/* Catégorie */}
        <div className="space-y-1">
          <Label htmlFor="category" className="text-xs text-muted-foreground">
            Catégorie
          </Label>
          {isEditing ? (
            <select
              id="category"
              value={form.category_id}
              onChange={(e) => onChangeForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">- Choisir -</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium max-w-full truncate ${categoryColorClass}`}>
                {categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Auteur */}
        <div className="space-y-1">
          <Label htmlFor="author" className="text-xs text-muted-foreground">
            Auteur
          </Label>
          {isEditing ? (
            <Input
              id="author"
              value={form.author}
              onChange={(e) => onChangeForm({ ...form, author: e.target.value })}
              className="text-sm"
            />
          ) : (
            <div className="flex items-center gap-1.5 font-medium py-1 text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{article.author || "Anonyme"}</span>
            </div>
          )}
        </div>

        {/* Date de publication */}
        <div className="space-y-1">
          <Label htmlFor="published_at" className="text-xs text-muted-foreground">
            Date de publication
          </Label>
          {isEditing ? (
            <Input
              id="published_at"
              type="date"
              value={form.published_at}
              onChange={(e) => onChangeForm({ ...form, published_at: e.target.value })}
              className="text-sm"
            />
          ) : (
            <div className="flex items-center gap-1.5 text-muted-foreground py-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{new Date(article.date).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
        </div>

        {/* Slug URL */}
        {/* Slug URL */}
        <div className="space-y-1">
          <Label htmlFor="slug" className="text-xs text-muted-foreground">
            Slug URL
          </Label>
          {isEditing ? (
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => onChangeForm({ ...form, slug: e.target.value })}
              className="font-mono text-xs"
            />
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/30 p-2 rounded-md overflow-x-auto scrollbar-none">
              <LinkIcon className="h-3 w-3 shrink-0" />
              <span className="break-all">{article.slug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}