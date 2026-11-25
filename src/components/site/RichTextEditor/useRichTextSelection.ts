import { useCallback, useRef, type RefObject } from "react";

export function useRichTextSelection(editorRef: RefObject<HTMLDivElement | null>) {
  const savedRange = useRef<Range | null>(null);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  }, [editorRef]);

  const restoreSelection = useCallback((): Range | null => {
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
  }, [editorRef]);

  const setSavedRange = useCallback((range: Range) => {
    savedRange.current = range.cloneRange();
  }, []);

  return { saveSelection, restoreSelection, setSavedRange };
}
