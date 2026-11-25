import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableSizeFieldsProps {
  rows: string;
  columns: string;
  onRowsChange: (value: string) => void;
  onColumnsChange: (value: string) => void;
}

export function TableSizeFields({
  rows,
  columns,
  onRowsChange,
  onColumnsChange,
}: TableSizeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="rich-text-table-rows">Lignes (1 à 10)</Label>
        <Input
          id="rich-text-table-rows"
          type="number"
          min={1}
          max={10}
          value={rows}
          onChange={(event) => onRowsChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rich-text-table-columns">Colonnes (1 à 10)</Label>
        <Input
          id="rich-text-table-columns"
          type="number"
          min={1}
          max={10}
          value={columns}
          onChange={(event) => onColumnsChange(event.target.value)}
        />
      </div>
    </div>
  );
}
