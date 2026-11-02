import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AUTHOR_ROLE_LABELS, POST_SORT_LABELS, POST_STATUS_LABELS, POST_TYPES, POST_TYPE_LABELS,
  type APICommunityCategory, type AuthorRole, type PostSort, type PostStatus, type PostType,
} from "@/data/community";

export type PostFiltersValue = {
  query: string;
  categoryId: string;
  type: PostType | "";
  scope: "general" | "training" | "";
  authorRole: AuthorRole | "";
  status: PostStatus | "";
  sort: PostSort;
  mine: boolean;
  pinned: boolean;
  unanswered: boolean;
  includeInactive: boolean;
};

export const EMPTY_POST_FILTERS: PostFiltersValue = {
  query: "", categoryId: "", type: "", scope: "", authorRole: "", status: "",
  sort: "recent", mine: false, pinned: false, unanswered: false, includeInactive: false,
};

const select = "h-9 cursor-pointer rounded-md border border-input bg-background px-3 text-sm";

interface Props {
  value: PostFiltersValue;
  onChange: (v: PostFiltersValue) => void;
  categories: APICommunityCategory[];
}

export function PostFilters({ value, onChange, categories }: Props) {
  const active = JSON.stringify(value) !== JSON.stringify(EMPTY_POST_FILTERS);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange({ ...value, categoryId: "" })}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${!value.categoryId ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}
        >
          Toutes
        </button>
        {categories.map((c) => {
          const selected = value.categoryId === c.id;
          return (
            <button
              key={c.id}
              title={c.description ?? undefined}
              onClick={() => onChange({ ...value, categoryId: c.id })}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${selected ? "text-white" : "bg-card hover:opacity-80"} ${c.isActive ? "" : "border-dashed opacity-60"}`}
              style={selected ? { backgroundColor: c.color, borderColor: c.color } : { borderColor: `${c.color}60`, color: c.color }}
            >
              {c.name}
              {c.postsCount !== null && <span className="ml-1.5 opacity-70">({c.postsCount})</span>}
              {!c.isActive && <span className="ml-1.5 text-[10px] uppercase">inactive</span>}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Rechercher une publication…" value={value.query} onChange={(e) => onChange({ ...value, query: e.target.value })} />
        </div>
        <select className={select} value={value.type} onChange={(e) => onChange({ ...value, type: e.target.value as PostType | "" })}>
          <option value="">Tous les types</option>
          {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
        </select>
        <select className={select} value={value.authorRole} onChange={(e) => onChange({ ...value, authorRole: e.target.value as AuthorRole | "" })}>
          <option value="">Tous les auteurs</option>
          {(Object.keys(AUTHOR_ROLE_LABELS) as AuthorRole[]).map((r) => <option key={r} value={r}>{AUTHOR_ROLE_LABELS[r]}</option>)}
        </select>
        <select className={select} value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as PostStatus | "" })}>
          <option value="">Tous les statuts</option>
          {(Object.keys(POST_STATUS_LABELS) as PostStatus[]).map((s) => <option key={s} value={s}>{POST_STATUS_LABELS[s]}</option>)}
        </select>
        <select className={select} value={value.scope} onChange={(e) => onChange({ ...value, scope: e.target.value as PostFiltersValue["scope"] })}>
          <option value="">Toute la communauté</option>
          <option value="general">Générale</option>
          <option value="training">Formations</option>
        </select>
        <select className={select} value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as PostSort })}>
          {(Object.keys(POST_SORT_LABELS) as PostSort[]).map((s) => <option key={s} value={s}>{POST_SORT_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={value.mine} onChange={(e) => onChange({ ...value, mine: e.target.checked })} /> Mes publications</label>
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={value.pinned} onChange={(e) => onChange({ ...value, pinned: e.target.checked })} /> Épinglées</label>
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={value.unanswered} onChange={(e) => onChange({ ...value, unanswered: e.target.checked })} /> Questions sans réponse</label>
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={value.includeInactive} onChange={(e) => onChange({ ...value, includeInactive: e.target.checked })} /> Inclure les catégories inactives</label>
        {active && <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_POST_FILTERS)}><X className="mr-1 h-3.5 w-3.5" /> Réinitialiser</Button>}
      </div>
    </div>
  );
}