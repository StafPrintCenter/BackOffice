import { Tag, Layers, GraduationCap, FolderKanban, FileText, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/categories";

interface CategoryContentCardProps {
  isEditing: boolean;
  category: APIAdminCategory;
  form: AdminCategoryPayload;
  onChangeForm: (form: AdminCategoryPayload) => void;
}

export function CategoryContentCard({
  isEditing,
  category,
  form,
  onChangeForm,
}: CategoryContentCardProps) {
  const usageBadges = [
    { label: "Thème de formation", active: isEditing ? form.is_training_theme : category.isTrainingTheme, icon: GraduationCap },
    { label: "Catégorie de projet", active: isEditing ? form.is_project_category : category.isProjectCategory, icon: FolderKanban },
    { label: "Catégorie d'article", active: isEditing ? form.is_article_category : category.isArticleCategory, icon: FileText },
    { label: "Catégorie newsletter", active: isEditing ? form.is_newsletter_category : category.isNewsletterCategory, icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Informations Générales */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Informations générales</h2>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Nom de la catégorie</Label>
            {isEditing ? (
              <Input
                id="name"
                value={form.name}
                onChange={(e) => onChangeForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            ) : (
              <div className="mt-1.5 text-lg font-medium">{category.name}</div>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            {isEditing ? (
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => onChangeForm({ ...form, slug: e.target.value })}
                className="mt-1.5 font-mono text-sm"
              />
            ) : (
              <div className="mt-1.5 font-mono text-sm text-muted-foreground">{category.slug}</div>
            )}
          </div>

          <div>
            <Label htmlFor="color_class">Classe couleur (Tailwind)</Label>
            {isEditing ? (
              <Input
                id="color_class"
                value={form.color_class}
                onChange={(e) => onChangeForm({ ...form, color_class: e.target.value })}
                placeholder="ex: bg-indigo-500/10 text-indigo-600"
                className="mt-1.5 font-mono text-sm"
              />
            ) : (
              <div className="mt-1.5 font-mono text-sm text-muted-foreground">
                <code>{category.colorClass || "Non spécifiée"}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration des usages */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-4">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Affectation et Usages</h2>
        </div>

        <div className="mt-6">
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                <Label htmlFor="is_training" className="flex items-center gap-3 cursor-pointer">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>Thème de formation</span>
                </Label>
                <Switch
                  id="is_training"
                  checked={form.is_training_theme}
                  onCheckedChange={(v) => onChangeForm({ ...form, is_training_theme: v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                <Label htmlFor="is_project" className="flex items-center gap-3 cursor-pointer">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  <span>Catégorie de projet</span>
                </Label>
                <Switch
                  id="is_project"
                  checked={form.is_project_category}
                  onCheckedChange={(v) => onChangeForm({ ...form, is_project_category: v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                <Label htmlFor="is_article" className="flex items-center gap-3 cursor-pointer">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Catégorie d'article</span>
                </Label>
                <Switch
                  id="is_article"
                  checked={form.is_article_category}
                  onCheckedChange={(v) => onChangeForm({ ...form, is_article_category: v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4 hover:bg-muted/30 transition-colors">
                <Label htmlFor="is_newsletter" className="flex items-center gap-3 cursor-pointer">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Catégorie newsletter</span>
                </Label>
                <Switch
                  id="is_newsletter"
                  checked={form.is_newsletter_category}
                  onCheckedChange={(v) => onChangeForm({ ...form, is_newsletter_category: v })}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {usageBadges.map((b) => (
                <div
                  key={b.label}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 ${b.active
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/20 opacity-60"
                    }`}
                >
                  <b.icon className={`h-4 w-4 ${b.active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">{b.label}</span>
                  <span
                    className={`ml-auto text-xs font-semibold ${b.active ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {b.active ? "Actif" : "Inactif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}