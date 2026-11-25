import { useCallback, type KeyboardEvent, type RefObject } from "react";
import {
  clearFormattingInEditor,
  exitEmptyListItem,
  insertPayloadAtRange,
  toggleInlineCode,
  updateTableAtRange,
} from "./utils";
import type { InsertionMode, InsertionPayload, TableAction } from "./types";

interface UseRichTextEditorActionsProps {
  editorRef: RefObject<HTMLDivElement | null>;
  saveSelection: () => void;
  restoreSelection: () => Range | null;
  setSavedRange: (range: Range) => void;
  publishChange: () => void;
  undo: () => void;
  redo: () => void;
  onDialogOpen: (mode: InsertionMode, selectedText: string) => void;
  onDialogClose: () => void;
}

export function useRichTextEditorActions({
  editorRef,
  saveSelection,
  restoreSelection,
  setSavedRange,
  publishChange,
  undo,
  redo,
  onDialogOpen,
  onDialogClose,
}: UseRichTextEditorActionsProps) {
  const activeList = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const list = element?.closest("ul, ol");
    return editor && list && editor.contains(list)
      ? list as HTMLOListElement | HTMLUListElement
      : null;
  }, [editorRef]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (command === "undo") {
      undo();
      return;
    }
    if (command === "redo") {
      redo();
      return;
    }
    restoreSelection();
    const argument = command === "formatBlock" && value ? `<${value}>` : value;
    document.execCommand(command, false, argument);
    publishChange();
  }, [publishChange, redo, restoreSelection, undo]);

  const applyListStyle = useCallback((ordered: boolean, style: string) => {
    restoreSelection();
    const expectedTag = ordered ? "OL" : "UL";
    if (activeList()?.tagName !== expectedTag) {
      document.execCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
    }
    const list = activeList();
    if (list?.tagName === expectedTag) list.style.listStyleType = style;
    publishChange();
  }, [activeList, publishChange, restoreSelection]);

  const openInsertionDialog = useCallback((mode: InsertionMode) => {
    saveSelection();
    onDialogOpen(mode, window.getSelection()?.toString() ?? "");
  }, [onDialogOpen, saveSelection]);

  const insertContent = useCallback((payload: InsertionPayload) => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;
    const nextRange = insertPayloadAtRange(editor, range, payload);
    if (!nextRange) return;
    setSavedRange(nextRange);
    onDialogClose();
    publishChange();
  }, [editorRef, onDialogClose, publishChange, restoreSelection, setSavedRange]);

  const clearFormatting = useCallback(() => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;
    setSavedRange(clearFormattingInEditor(editor, range));
    publishChange();
  }, [editorRef, publishChange, restoreSelection, setSavedRange]);

  const applyInlineCode = useCallback(() => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;
    setSavedRange(toggleInlineCode(editor, range));
    publishChange();
  }, [editorRef, publishChange, restoreSelection, setSavedRange]);

  const applyTableAction = useCallback((action: TableAction) => {
    const editor = editorRef.current;
    const range = restoreSelection();
    if (!editor || !range) return;
    const nextRange = updateTableAtRange(editor, range, action);
    if (!nextRange) return;
    setSavedRange(nextRange);
    publishChange();
  }, [editorRef, publishChange, restoreSelection, setSavedRange]);

  const handleEditorKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (event.key !== "Enter") return;
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) return;
    const nextRange = exitEmptyListItem(editor, selection.getRangeAt(0));
    if (!nextRange) return;
    event.preventDefault();
    setSavedRange(nextRange);
    publishChange();
  }, [editorRef, publishChange, redo, setSavedRange, undo]);

  return {
    executeCommand,
    applyListStyle,
    openInsertionDialog,
    insertContent,
    clearFormatting,
    applyInlineCode,
    applyTableAction,
    handleEditorKeyDown,
  };
}
