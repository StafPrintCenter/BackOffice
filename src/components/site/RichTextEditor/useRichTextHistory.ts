import { useCallback, useEffect, useRef, type RefObject } from "react";

interface HistoryState {
  entries: string[];
  index: number;
}

export function useRichTextHistory(
  editorRef: RefObject<HTMLDivElement | null>,
  value: string,
  onChange: (html: string) => void,
  saveSelection: () => void,
  updateToolbarState: () => void,
) {
  const history = useRef<HistoryState>({ entries: [""], index: 0 });
  const lastEmittedHtml = useRef<string | null>(null);

  const emitCurrentContent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    lastEmittedHtml.current = html;
    onChange(html);
    saveSelection();
    updateToolbarState();
  }, [editorRef, onChange, saveSelection, updateToolbarState]);

  const publishChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const html = editor.innerHTML;
    const currentHistory = history.current;
    if (currentHistory.entries[currentHistory.index] !== html) {
      currentHistory.entries = currentHistory.entries.slice(0, currentHistory.index + 1);
      currentHistory.entries.push(html);
      currentHistory.index += 1;
    }
    emitCurrentContent();
  }, [editorRef, emitCurrentContent]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML === value) {
      if (lastEmittedHtml.current === value) lastEmittedHtml.current = null;
      if (history.current.entries[history.current.index] !== editor.innerHTML) {
        history.current = { entries: [editor.innerHTML], index: 0 };
      }
      return;
    }
    if (lastEmittedHtml.current === value) {
      lastEmittedHtml.current = null;
      return;
    }
    editor.innerHTML = value || "";
    history.current = { entries: [editor.innerHTML], index: 0 };
    updateToolbarState();
  }, [editorRef, updateToolbarState, value]);

  const restoreHistoryEntry = useCallback((index: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    const entry = history.current.entries[index];
    if (entry === undefined) return;
    history.current.index = index;
    editor.innerHTML = entry;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    emitCurrentContent();
  }, [editorRef, emitCurrentContent]);

  const undo = useCallback(() => {
    if (history.current.index > 0) restoreHistoryEntry(history.current.index - 1);
  }, [restoreHistoryEntry]);

  const redo = useCallback(() => {
    if (history.current.index < history.current.entries.length - 1) {
      restoreHistoryEntry(history.current.index + 1);
    }
  }, [restoreHistoryEntry]);

  return { publishChange, undo, redo };
}
