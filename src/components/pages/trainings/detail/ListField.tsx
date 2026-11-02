import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props { label: string; values: string[]; onChange: (v: string[]) => void }

export function TrainingDetailListField({ label, values, onChange }: Props) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input value={v} onChange={(e) => onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))} />
            <Button variant="outline" size="icon" onClick={() => onChange(values.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange([...values, ""])}><Plus className="mr-1 h-3 w-3" /> Ajouter</Button>
      </div>
    </div>
  );
}