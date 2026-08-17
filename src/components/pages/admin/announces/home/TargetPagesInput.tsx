import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnnouncementTargetPagesInputProps {
  value: string[];
  onChange: (pages: string[]) => void;
}

export function AnnouncementTargetPagesInput({ value, onChange }: AnnouncementTargetPagesInputProps) {
  const handleAdd = () => onChange([...value, ""]);

  const handleUpdate = (index: number, val: string) => {
    const updated = [...value];
    updated[index] = val;
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = value.filter((_, idx) => idx !== index);
    onChange(updated.length > 0 ? updated : [""]);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>Pages ciblées (optionnel, vide = toutes les pages)</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter une page
        </Button>
      </div>
      <div className="mt-2 space-y-2">
        {value.map((page, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="ex: /formations/*"
              value={page}
              onChange={(e) => handleUpdate(index, e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}