import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TrainingProgramModule } from "@/data/trainings";

interface Props { value: TrainingProgramModule[]; onChange: (v: TrainingProgramModule[]) => void }

export function TrainingDetailProgramField({ value, onChange }: Props) {
  const setModule = (mi: number, patch: Partial<TrainingProgramModule>) =>
    onChange(value.map((m, i) => (i === mi ? { ...m, ...patch } : m)));

  return (
    <div>
      <Label>Programme (modules)</Label>
      <div className="mt-2 space-y-3">
        {value.map((m, mi) => (
          <div key={mi} className="space-y-2 rounded-lg border p-3">
            <div className="flex gap-2">
              <Input placeholder="Titre du module" value={m.title} onChange={(e) => setModule(mi, { title: e.target.value })} />
              <Button variant="outline" size="icon" onClick={() => onChange(value.filter((_, i) => i !== mi))}><Trash2 className="h-3 w-3" /></Button>
            </div>
            <div className="space-y-1 border-l-2 pl-3">
              {m.items.map((it, li) => (
                <div key={li} className="flex gap-2">
                  <Input value={it} onChange={(e) => setModule(mi, { items: m.items.map((x, i) => (i === li ? e.target.value : x)) })} />
                  <Button variant="ghost" size="icon" onClick={() => setModule(mi, { items: m.items.filter((_, i) => i !== li) })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setModule(mi, { items: [...m.items, ""] })}><Plus className="mr-1 h-3 w-3" /> Élément</Button>
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange([...value, { title: "", items: [""] }])}><Plus className="mr-1 h-3 w-3" /> Module</Button>
      </div>
    </div>
  );
}