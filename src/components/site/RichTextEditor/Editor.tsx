import { useCallback, useRef, useState } from "react";
import { RichTextInsertionDialog } from "./InsertionDialog";
import { RichTextToolbar } from "./Toolbar";
import type { InsertionMode } from "./types";
import { useRichTextEditorActions } from "./useRichTextEditorActions";
import { useRichTextHistory } from "./useRichTextHistory";
import { useRichTextSelection } from "./useRichTextSelection";
import { useRichTextToolbarState } from "./useRichTextToolbarState";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  id?: string;
  ariaLabelledBy?: string;
  placeholder?: string;
  minHeightClassName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  id,
  ariaLabelledBy,
  placeholder,
  minHeightClassName = "min-h-[280px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [dialogMode, setDialogMode] = useState<InsertionMode | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const { toolbarState, updateToolbarState } = useRichTextToolbarState(editorRef);
  const { saveSelection, restoreSelection, setSavedRange } = useRichTextSelection(editorRef);
  const { publishChange, undo, redo } = useRichTextHistory(
    editorRef,
    value,
    onChange,
    saveSelection,
    updateToolbarState,
  );
  const onDialogOpen = useCallback((mode: InsertionMode, text: string) => {
    setSelectedText(text);
    setDialogMode(mode);
  }, []);
  const actions = useRichTextEditorActions({
    editorRef,
    saveSelection,
    restoreSelection,
    setSavedRange,
    publishChange,
    undo,
    redo,
    onDialogOpen,
    onDialogClose: () => setDialogMode(null),
  });

  return (
    <div className="rounded-lg border border-input">
      <RichTextToolbar
        state={toolbarState}
        onBeforeAction={saveSelection}
        onCommand={actions.executeCommand}
        onListStyle={actions.applyListStyle}
        onTextColor={(color) => actions.executeCommand("foreColor", color)}
        onToggleCode={actions.applyInlineCode}
        onTableAction={actions.applyTableAction}
        onInsert={actions.openInsertionDialog}
        onClearFormatting={actions.clearFormatting}
      />
      <div
        ref={editorRef}
        id={id}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-labelledby={ariaLabelledBy}
        suppressContentEditableWarning
        onInput={publishChange}
        onKeyDown={actions.handleEditorKeyDown}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder={placeholder}
        className={`rich-text-content overflow-y-auto bg-background px-4 py-3 text-sm outline-none ${minHeightClassName} empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
      />
      <RichTextInsertionDialog
        mode={dialogMode}
        selectedText={selectedText}
        onOpenChange={(open) => !open && setDialogMode(null)}
        onInsert={actions.insertContent}
      />
    </div>
  );
}
