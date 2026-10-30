import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_SORT_LABELS, POST_TYPES, POST_TYPE_LABELS, type APICommunityCategory, type PostSort, type PostType } from "@/data/community";

export type PostFiltersValue = {
  query: string;
  categoryId: string;
  type: PostType | "";
  scope: "general" | "training" | "";
  sort: PostSort;
  mine: boolean;
  unanswered: boolean;
};

export const EMPTY_POST_FILTERS: PostFiltersValue = {
  query: "", categoryId: "", type: "", scope: "", sort: "recent", mine: false, unanswered: false,
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
        {categories.map((c) => (
          <button
            key={c.id}
            title={c.description ?? undefined}
            onClick={() => onChange({ ...value, categoryId: c.id })}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${value.categoryId === c.id ? "text-white" : "bg-card hover:opacity-80"}`}
            style={value.categoryId === c.id
              ? { backgroundColor: c.color, borderColor: c.color }
              : { borderColor: `${c.color}60`, color: c.color }}
          >
            {c.name}
          </button>
        ))}
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
        <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={value.unanswered} onChange={(e) => onChange({ ...value, unanswered: e.target.checked })} /> Questions sans réponse</label>
        {active && <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_POST_FILTERS)}><X className="mr-1 h-3.5 w-3.5" /> Réinitialiser</Button>}
      </div>
    </div>
  );
}