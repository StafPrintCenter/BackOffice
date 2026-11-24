import { useCallback, useEffect, useRef, useState } from "react";
import {
  RichTextInsertionDialog, RichTextToolbar, clearFormattingInEditor, insertPayloadAtRange,
  type InsertionMode, type InsertionPayload, type RichTextToolbarState
} from "./";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

const COMMAND_STATES = ["bold", "italic", "underline", "strikeThrough", "subscript", "superscript"];

const INITIAL_TOOLBAR_STATE: RichTextToolbarState = {
  blockFormat: "p",
  listType: "",
  listStyle: "",
  alignment: "left",
  activeCommands: {},
};

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
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);

  const updateToolbarState = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    if (!editor || !anchorNode || !editor.contains(anchorNode)) return;

    const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
    const block = anchorElement?.closest("p, h1, h2, h3, h4, h5, h6, blockquote, li");
    const list = anchorElement?.closest("ul, ol");
    const blockFormat = block?.tagName === "BLOCKQUOTE"
      ? "blockquote"
      : block && /^H[1-6]$/.test(block.tagName)
        ? block.tagName.toLowerCase()
        : "p";
    const listType: RichTextToolbarState["listType"] =
      list?.tagName === "UL" ? "ul" : list?.tagName === "OL" ? "ol" : "";
    const listStyle = list ? window.getComputedStyle(list).listStyleType : "";
    const alignment = block
      ? window.getComputedStyle(block).textAlign
      : "left";
    const activeCommands = Object.fromEntries(
      COMMAND_STATES.map((command) => [command, document.queryCommandState(command)]),
    );

    setToolbarState({
      blockFormat,
      listType,
      listStyle,
      alignment: alignment === "start" ? "left" : alignment === "end" ? "right" : alignment,
      activeCommands,
    });
  }, []);

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
    updateToolbarState();
  }, [value, updateToolbarState]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarState);
    return () => document.removeEventListener("selectionchange", updateToolbarState);
  }, [updateToolbarState]);

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
    updateToolbarState();
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
        state={toolbarState}
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
