import { Columns3, Minus, Plus, Rows3 } from "lucide-react";
import { ToolbarButton, ToolbarSeparator } from "./ToolbarParts";
import type { TableAction } from "./types";

interface TableControlsProps {
  rows: number;
  columns: number;
  onBeforeAction: () => void;
  onAction: (action: TableAction) => void;
}

export function TableControls({ rows, columns, onBeforeAction, onAction }: TableControlsProps) {
  if (rows === 0 || columns === 0) return null;

  return (
    <>
      <ToolbarSeparator />
      <ToolbarButton
        icon={Rows3}
        label="Ajouter une ligne"
        onMouseDown={onBeforeAction}
        onClick={() => onAction("add-row")}
      />
      <ToolbarButton
        icon={Minus}
        label="Supprimer la ligne"
        disabled={rows <= 1}
        onMouseDown={onBeforeAction}
        onClick={() => onAction("remove-row")}
      />
      <ToolbarButton
        icon={Columns3}
        label="Ajouter une colonne"
        onMouseDown={onBeforeAction}
        onClick={() => onAction("add-column")}
      />
      <ToolbarButton
        icon={Minus}
        label="Supprimer la colonne"
        disabled={columns <= 1}
        onMouseDown={onBeforeAction}
        onClick={() => onAction("remove-column")}
      />
    </>
  );
}
