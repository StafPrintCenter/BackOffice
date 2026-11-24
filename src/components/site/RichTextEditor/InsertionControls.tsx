import {
  Eraser,
  Image,
  Link2,
  Redo,
  Smile,
  Table2,
  Undo,
  Video,
} from "lucide-react";
import { ToolbarButton, ToolbarSeparator } from "./ToolbarParts";
import type { InsertionMode } from "./types";

interface InsertionControlsProps {
  onBeforeAction: () => void;
  onCommand: (command: string, value?: string) => void;
  onInsert: (mode: InsertionMode) => void;
  onClearFormatting: () => void;
}

export function InsertionControls({
  onBeforeAction,
  onCommand,
  onInsert,
  onClearFormatting,
}: InsertionControlsProps) {
  return (
    <>
      <ToolbarSeparator />
      <ToolbarButton icon={Link2} label="Lien" onMouseDown={onBeforeAction} onClick={() => onInsert("link")} />
      <ToolbarButton icon={Image} label="Image par URL" onMouseDown={onBeforeAction} onClick={() => onInsert("image")} />
      <ToolbarButton icon={Video} label="Vidéo par URL" onMouseDown={onBeforeAction} onClick={() => onInsert("video")} />
      <ToolbarButton icon={Smile} label="Emoji ou symbole" onMouseDown={onBeforeAction} onClick={() => onInsert("emoji")} />
      <ToolbarButton icon={Table2} label="Ajouter un tableau" onMouseDown={onBeforeAction} onClick={() => onInsert("table")} />
      <ToolbarButton icon={Eraser} label="Effacer le formatage" onMouseDown={onBeforeAction} onClick={onClearFormatting} />
      <ToolbarSeparator />
      <ToolbarButton icon={Undo} label="Annuler" onMouseDown={onBeforeAction} onClick={() => onCommand("undo")} />
      <ToolbarButton icon={Redo} label="Rétablir" onMouseDown={onBeforeAction} onClick={() => onCommand("redo")} />
    </>
  );
}
