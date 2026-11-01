import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SmilePlus } from "lucide-react";
import { REACTION_META, REACTION_TYPES, type ReactionState, type ReactionTarget, type ReactionType } from "@/data/community";
import { useRemoveReaction, useSetReaction } from "@/stores/useCommunityStore";
import { ReactorsDialog } from "./ReactorsDialog";

interface Props {
  target: ReactionTarget;
  targetId: string;
  myReaction: string | null;
  reactions: Record<string, number>;
  reactionsTotal: number;
  canReact: boolean;
  compact?: boolean;
}

export function ReactionBar({ target, targetId, myReaction, reactions, reactionsTotal, canReact, compact }: Props) {
  const [state, setState] = useState<ReactionState>({
    myReaction: myReaction as ReactionType | null, reactions, reactionsTotal,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const set = useSetReaction(target);
  const remove = useRemoveReaction(target);

  // Resynchronise quand les données du parent changent (rechargement)
  useEffect(() => {
    setState({ myReaction: myReaction as ReactionType | null, reactions, reactionsTotal });
  }, [myReaction, reactions, reactionsTotal]);

  const pending = set.isPending || remove.isPending;
  const handlers = { onSuccess: (s: ReactionState) => setState(s), onError: (e: Error) => toast.error(e.message) };

  const choose = (type: ReactionType) => {
    setPickerOpen(false);
    // Cliquer sur sa propre réaction la retire
    if (state.myReaction === type) remove.mutate(targetId, handlers);
    else set.mutate({ id: targetId, type }, handlers);
  };

  const top = REACTION_TYPES.filter((t) => state.reactions[t]).sort((a, b) => (state.reactions[b] ?? 0) - (state.reactions[a] ?? 0)).slice(0, 3);
  const mine = state.myReaction ? REACTION_META[state.myReaction] : null;

  return (
    <div className={`relative flex flex-wrap items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      {canReact && (
        <div className="relative">
          <button
            type="button"
            disabled={pending}
            onClick={() => (mine ? remove.mutate(targetId, handlers) : setPickerOpen((v) => !v))}
            onContextMenu={(e) => { e.preventDefault(); setPickerOpen((v) => !v); }}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 transition disabled:opacity-50 ${mine ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"}`}
            title={mine ? "Retirer ma réaction" : "Réagir"}
          >
            {mine ? <><span>{mine.emoji}</span> {mine.label}</> : <><SmilePlus className="h-3.5 w-3.5" /> Réagir</>}
          </button>
          {mine && (
            <button type="button" onClick={() => setPickerOpen((v) => !v)} className="ml-1 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground">
              changer
            </button>
          )}

          {pickerOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border bg-card p-1.5 shadow-lg">
              {REACTION_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  title={REACTION_META[t].label}
                  onClick={() => choose(t)}
                  className={`h-9 w-9 cursor-pointer rounded-full text-xl transition hover:scale-125 hover:bg-muted ${state.myReaction === t ? "bg-primary/10" : ""}`}
                >
                  {REACTION_META[t].emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {state.reactionsTotal > 0 && (
        <button type="button" onClick={() => setListOpen(true)} className="inline-flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-muted-foreground hover:bg-muted" title="Voir qui a réagi">
          <span className="flex">{top.map((t) => <span key={t}>{REACTION_META[t].emoji}</span>)}</span>
          <span className="font-medium">{state.reactionsTotal}</span>
        </button>
      )}

      <ReactorsDialog target={target} targetId={targetId} open={listOpen} onOpenChange={setListOpen} />
    </div>
  );
}