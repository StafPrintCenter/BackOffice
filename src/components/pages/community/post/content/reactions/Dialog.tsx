import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AUTHOR_ROLE_LABELS, REACTION_META, REACTION_TYPES, formatPostDate, initials,
  type AuthorRole, type ReactionTarget, type ReactionType,
} from "@/data/community";
import { useReactorsList } from "@/stores/useCommunityStore";
import { Pager } from "@/components/trainings/sessions/Pager";

interface Props { target: ReactionTarget; targetId: string; open: boolean; onOpenChange: (v: boolean) => void }

export function ReactorsDialog({ target, targetId, open, onOpenChange }: Props) {
  const [type, setType] = useState<ReactionType | "">("");
  const [role, setRole] = useState<AuthorRole | "">("");
  const [page, setPage] = useState(1);
  const { reactors, summary, total, meta, isLoading, isError } = useReactorsList(target, targetId, { type, role, page, perPage: 12 }, open);

  const tab = (active: boolean) =>
    `cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader><DialogTitle>Réactions ({total})</DialogTitle></DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          <button className={tab(type === "")} onClick={() => { setType(""); setPage(1); }}>Toutes</button>
          {REACTION_TYPES.filter((t) => summary[t]).map((t) => (
            <button key={t} className={tab(type === t)} onClick={() => { setType(t); setPage(1); }}>
              {REACTION_META[t].emoji} {summary[t]}
            </button>
          ))}
        </div>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value as AuthorRole | ""); setPage(1); }}
          className="h-8 w-fit cursor-pointer rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="">Tous les rôles</option>
          {(Object.keys(AUTHOR_ROLE_LABELS) as AuthorRole[]).map((r) => <option key={r} value={r}>{AUTHOR_ROLE_LABELS[r]}</option>)}
        </select>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>
        ) : isError ? (
          <p className="text-sm text-destructive">Impossible de charger les réactions.</p>
        ) : reactors.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucune réaction.</p>
        ) : (
          <ul className="space-y-2">
            {reactors.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                {r.user.photo ? (
                  <img src={r.user.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{initials(r.user.name)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{AUTHOR_ROLE_LABELS[r.user.role]} · {formatPostDate(r.reactedAt)}</div>
                </div>
                <span className="text-lg" title={REACTION_META[r.type]?.label}>{REACTION_META[r.type]?.emoji}</span>
              </li>
            ))}
          </ul>
        )}

        {meta && <Pager page={meta.currentPage} lastPage={meta.lastPage} onChange={setPage} />}
      </DialogContent>
    </Dialog>
  );
}