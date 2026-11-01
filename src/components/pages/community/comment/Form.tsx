import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MAX_COMMENT_LENGTH, type APIComment } from "@/data/community";
import { useCreateComment, useUpdateComment } from "@/stores/useCommunityStore";

type Props =
  | { mode: "create"; postId: string; parentId?: string; replyToName?: string; onDone?: () => void; onCancel?: () => void }
  | { mode: "edit"; comment: APIComment; onDone?: () => void; onCancel?: () => void };

export function CommentForm(props: Props) {
  const create = useCreateComment();
  const update = useUpdateComment();
  const [body, setBody] = useState(props.mode === "edit" ? props.comment.body : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setError(null); }, [body]);

  const pending = create.isPending || update.isPending;

  const submit = () => {
    const text = body.trim();
    if (!text) return setError("Le commentaire ne peut pas être vide.");

    const callbacks = { onError: (e: Error) => setError(e.message) };

    if (props.mode === "edit") {
      update.mutate({ id: props.comment.id, body: text }, {
        ...callbacks,
        onSuccess: () => { toast.success("Commentaire modifié"); props.onDone?.(); },
      });
    } else {
      create.mutate({ postId: props.postId, body: text, parentId: props.parentId }, {
        ...callbacks,
        onSuccess: () => { toast.success(props.parentId ? "Réponse publiée" : "Commentaire publié"); setBody(""); props.onDone?.(); },
      });
    }
  };

  const placeholder =
    props.mode === "create" && props.replyToName ? `Répondre à ${props.replyToName}…` : "Écrire un commentaire…";

  return (
    <div className="space-y-2">
      <Textarea
        rows={props.mode === "create" && !props.parentId ? 3 : 2}
        maxLength={MAX_COMMENT_LENGTH}
        value={body}
        placeholder={placeholder}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") submit(); }}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">{body.length}/{MAX_COMMENT_LENGTH} · Ctrl+Entrée pour envoyer</span>
        <div className="flex gap-2">
          {props.onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={props.onCancel}><X className="mr-1 h-3.5 w-3.5" /> Annuler</Button>
          )}
          <Button type="button" size="sm" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1 h-3.5 w-3.5" />}
            {props.mode === "edit" ? "Enregistrer" : props.parentId ? "Répondre" : "Commenter"}
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}