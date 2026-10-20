import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/site/RichTextEditor";
import type { AdminArticlePayload } from "@/data/articles";

interface ArticleContentCardProps {
  isEditing: boolean;
  article: { title: string; excerpt?: string; body: string };
  form: AdminArticlePayload;
  onChangeForm: (form: AdminArticlePayload) => void;
}

export function ArticleContentCard({ isEditing, article, form, onChangeForm }: ArticleContentCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Rédaction de l'article</h2>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <Label htmlFor="title">Titre de l'article</Label>
          {isEditing ? (
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onChangeForm({ ...form, title: e.target.value })}
              className="mt-1.5"
            />
          ) : (
            <h1 className="mt-1.5 font-display text-2xl font-bold">{article.title}</h1>
          )}
        </div>

        <div>
          <Label htmlFor="excerpt">Extrait (résumé)</Label>
          {isEditing ? (
            <Input
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => onChangeForm({ ...form, excerpt: e.target.value })}
              className="mt-1.5"
            />
          ) : (
            <p className="mt-1.5 text-sm text-muted-foreground italic">
              {article.excerpt || "Aucun extrait défini."}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="body">Contenu principal</Label>
          {isEditing ? (
            <div className="mt-1.5">
              <RichTextEditor
                value={form.body}
                onChange={(html) => onChangeForm({ ...form, body: html })}
                placeholder="Rédigez votre article..."
              />
            </div>
          ) : (
            <div
              className="mt-1.5 prose prose-sm max-w-none rounded-xl border bg-muted/10 p-6 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          )}
        </div>
      </div>
    </div>
  );
}