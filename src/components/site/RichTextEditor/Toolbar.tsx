import { BlockFormatControls, FormattingControls, InsertionControls, ToolbarSeparator } from "./";
import type { InsertionMode, RichTextToolbarState } from "./types";

interface RichTextToolbarProps {
  state: RichTextToolbarState;
  onBeforeAction: () => void;
  onCommand: (command: string, value?: string) => void;
  onListStyle: (ordered: boolean, style: string) => void;
  onTextColor: (color: string) => void;
  onInsert: (mode: InsertionMode) => void;
  onClearFormatting: () => void;
}

export function RichTextToolbar({
  state,
  onBeforeAction,
  onCommand,
  onListStyle,
  onTextColor,
  onInsert,
  onClearFormatting,
}: RichTextToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Mise en forme du texte"
      className="sticky top-0 z-30 flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/95 p-1.5 shadow-sm backdrop-blur"
    >
      <BlockFormatControls
        state={state}
        onBeforeAction={onBeforeAction}
        onCommand={onCommand}
        onListStyle={onListStyle}
      />
      <ToolbarSeparator />
      <FormattingControls
        state={state}
        onBeforeAction={onBeforeAction}
        onCommand={onCommand}
        onTextColor={onTextColor}
      />
      <InsertionControls
        onBeforeAction={onBeforeAction}
        onCommand={onCommand}
        onInsert={onInsert}
        onClearFormatting={onClearFormatting}
      />
    </div>
  );
}
