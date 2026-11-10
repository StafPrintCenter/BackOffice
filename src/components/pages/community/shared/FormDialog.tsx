import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_MB, MAX_TAGS, POST_TYPES, POST_TYPE_LABELS, type APIPost, type PostType } from "@/data/community";
import { useCommunityCategories, useCreatePost, useUpdatePost, usePostDetail } from "@/stores/useCommunityStore";
import { useAdminTrainingsList } from "@/stores/useTrainingsStore";

const select = "mt-1 h-9 w-full cursor-pointer rounded-md border border-input bg-background px-3 text-sm";

interface Props {
  mode: "create" | "edit";
  post?: APIPost;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** "a, b ,c" → ["a","b","c"], sans doublons, limité à MAX_TAGS */
const parseTags = (raw: string) =>
  Array.from(new Set(raw.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)));

export function PostFormDialog({ mode, post, open, onOpenChange }: Props) {
  const isEdit = mode === "edit";
  const { categories, isLoading: isCategoriesLoading } = useCommunityCategories();
  const { items: trainings } = useAdminTrainingsList({ perPage: 100 });
  const { post: detail } = usePostDetail(isEdit && open ? post?.id : undefined);
  const source = detail ?? post;
  const create = useCreatePost();
  const update = useUpdatePost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [trainingId, setTrainingId] = useState("");
  const [type, setType] = useState<PostType>("discussion");
  const [tagsRaw, setTagsRaw] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialise à chaque ouverture
  useEffect(() => {
    if (!open) return;
    setTitle(source?.title ?? "");
    setBody(source?.body ?? "");
    setCategoryId(source?.category.id ?? "");
    setTrainingId(source?.training?.id ?? "");
    setType(source?.type ?? "discussion");
    setTagsRaw(source?.tags.join(", ") ?? "");
    setFiles([]);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source?.id, source?.body]);

  useEffect(() => {
    if (open && !categoryId && categories.length) setCategoryId(categories[0].id);
  }, [open, categoryId, categories]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_ATTACHMENT_MB * 1024 * 1024) { setError(`« ${f.name} » dépasse ${MAX_ATTACHMENT_MB} Mo.`); continue; }
      if (next.length >= MAX_ATTACHMENTS) { setError(`${MAX_ATTACHMENTS} fichiers maximum.`); break; }
      next.push(f);
    }
    setFiles(next);
  };

  const submit = () => {
    const tags = parseTags(tagsRaw);
    if (title.trim().length < 3) return setError("Le titre doit contenir au moins 3 caractères.");
    if (body.trim().length < 3) return setError("Le contenu doit contenir au moins 3 caractères.");
    if (!categoryId) return setError("Choisissez une catégorie.");
    if (tags.length > MAX_TAGS) return setError(`${MAX_TAGS} étiquettes maximum.`);
    setError(null);

    const done = { onError: (e: Error) => setError(e.message) };

    if (isEdit && post) {
      update.mutate(
        { id: post.id, payload: { title: title.trim(), body: body.trim(), categoryId, type, tags } },
        { ...done, onSuccess: () => { toast.success("Publication modifiée"); onOpenChange(false); } },
      );
    } else {
      create.mutate(
        { title: title.trim(), body: body.trim(), categoryId, type, tags, trainingId: trainingId || undefined, attachments: files },
        { ...done, onSuccess: () => { toast.success("Publication créée"); onOpenChange(false); } },
      );
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la publication" : "Nouvelle publication"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "La formation et les pièces jointes ne peuvent plus être modifiées."
              : "Sans formation, la publication va dans la communauté générale."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Titre</Label>
            <Input value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{title.length}/200</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Catégorie</Label>
              <select className={select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {!categoryId && (
                  <option value="" disabled>
                    {isCategoriesLoading ? "Chargement…" : "Choisissez une catégorie"}
                  </option>
                )}
                {source && !categories.some((c) => c.id === source.category.id) && (
                  <option value={source.category.id}>{source.category.name} (inactive)</option>
                )}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Type</Label>
              <select className={select} value={type} onChange={(e) => setType(e.target.value as PostType)}>
                {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
          </div>

          {!isEdit && (
            <div>
              <Label>Formation (optionnel)</Label>
              <select className={select} value={trainingId} onChange={(e) => setTrainingId(e.target.value)}>
                <option value="">Communauté générale</option>
                {trainings.map((t: { id: string; title: string }) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <Label>Contenu</Label>
            <Textarea rows={8} maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{body.length}/10000</p>
          </div>

          <div>
            <Label>Étiquettes (optionnel, séparées par des virgules)</Label>
            <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="indesign, mise en page" />
            <p className="mt-1 text-[11px] text-muted-foreground">{parseTags(tagsRaw).length}/{MAX_TAGS}</p>
          </div>

          {!isEdit && (
            <div>
              <Label>Pièces jointes (optionnel)</Label>
              <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/40">
                <Paperclip className="h-4 w-4" /> Ajouter des fichiers ({MAX_ATTACHMENTS} max, {MAX_ATTACHMENT_MB} Mo chacun)
                <input type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-xs">
                      <span className="truncate">{f.name}</span>
                      <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="ml-2 cursor-pointer text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={pending || (isEdit && !detail)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? "Enregistrer" : "Publier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}