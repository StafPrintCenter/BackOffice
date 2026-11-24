import { useEffect, useRef, useState } from "react";
import {
  RichTextInsertionDialog, RichTextToolbar, clearFormattingInEditor, insertPayloadAtRange,
  type InsertionMode, type InsertionPayload
} from "./";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[280px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const lastEmittedHtml = useRef<string | null>(null);
  const [dialogMode, setDialogMode] = useState<InsertionMode | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML === value) {
      if (lastEmittedHtml.current === value) lastEmittedHtml.current = null;
      return;
    }
    if (lastEmittedHtml.current === value) {
      lastEmittedHtml.current = null;
      return;
    }
    editor.innerHTML = value || "";
  }, [value]);

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = (): Range | null => {
    const editor = editorRef.current;
    if (!editor) return null;
    editor.focus();

    const selection = window.getSelection();
    const range = savedRange.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      selection?.removeAllRanges();
      selection?.addRange(range);
      return range;
    }

    if (selection?.rangeCount && editor.contains(selection.anchorNode)) {
      return selection.getRangeAt(0);
    }

    const insertionRange = document.createRange();
    insertionRange.selectNodeContents(editor);
    insertionRange.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(insertionRange);
    savedRange.current = insertionRange.cloneRange();
    return insertionRange;
  };

  const publishChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    lastEmittedHtml.current = html;
    onChange(html);
    saveSelection();
  };

  const activeList = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const list = element?.closest("ul, ol");
    return editor && list && editor.contains(list)
      ? (list as HTMLOListElement | HTMLUListElement)
      : null;
  };

  const executeCommand = (command: string, value?: string) => {
    restoreSelection();
    const argument = command === "formatBlock" && value ? `<${value}>` : value;
    document.execCommand(command, false, argument);
    publishChange();
  };

  const applyListStyle = (ordered: boolean, style: string) => {
    restoreSelection();
    const expectedTag = ordered ? "OL" : "UL";
    if (activeList()?.tagName !== expectedTag) {
      document.execCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
    }
    const list = activeList();
    if (list?.tagName === expectedTag) list.style.listStyleType = style;
    publishChange();
  };

  const openInsertionDialog = (mode: InsertionMode) => {
    saveSelection();
    setSelectedText(savedRange.current?.toString() ?? "");
    setDialogMode(mode);
  };

  const insertContent = (payload: InsertionPayload) => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;

    const nextRange = insertPayloadAtRange(editor, range, payload);
    if (!nextRange) return;
    savedRange.current = nextRange.cloneRange();
    setDialogMode(null);
    publishChange();
  };

  const clearFormatting = () => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;
    savedRange.current = clearFormattingInEditor(editor, range);
    publishChange();
  };

  return (
    <div className="rounded-lg border border-input">
      <RichTextToolbar
        onBeforeAction={saveSelection}
        onCommand={executeCommand}
        onListStyle={applyListStyle}
        onTextColor={(color) => executeCommand("foreColor", color)}
        onInsert={openInsertionDialog}
        onClearFormatting={clearFormatting}
      />
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
        onInput={publishChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder={placeholder}
        className={`rich-text-content overflow-y-auto bg-background px-4 py-3 text-sm outline-none ${minHeightClassName} empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
      />
      <RichTextInsertionDialog
        mode={dialogMode}
        selectedText={selectedText}
        onOpenChange={(open) => !open && setDialogMode(null)}
        onInsert={insertContent}
      />
    </div>
  );
}
