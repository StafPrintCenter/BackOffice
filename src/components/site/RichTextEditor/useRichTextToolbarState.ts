import { useCallback, useEffect, useState, type RefObject } from "react";
import type { RichTextToolbarState } from "./types";

const COMMAND_STATES = ["bold", "italic", "underline", "strikeThrough", "subscript", "superscript"];

const INITIAL_TOOLBAR_STATE: RichTextToolbarState = {
  blockFormat: "p",
  listType: "",
  listStyle: "",
  alignment: "left",
  activeCommands: {},
  hasSelection: false,
  tableRows: 0,
  tableColumns: 0,
};

export function useRichTextToolbarState(editorRef: RefObject<HTMLDivElement | null>) {
  const [toolbarState, setToolbarState] = useState(INITIAL_TOOLBAR_STATE);

  const updateToolbarState = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    if (!editor || !anchorNode || !editor.contains(anchorNode)) return;

    const anchorElement = anchorNode instanceof Element ? anchorNode : anchorNode.parentElement;
    const block = anchorElement?.closest("p, h1, h2, h3, h4, h5, h6, blockquote, pre, li");
    const list = anchorElement?.closest("ul, ol");
    const blockFormat = block?.tagName === "BLOCKQUOTE"
      ? "blockquote"
      : block?.tagName === "PRE"
        ? "pre"
        : block && /^H[1-6]$/.test(block.tagName)
          ? block.tagName.toLowerCase()
          : "p";
    const listType: RichTextToolbarState["listType"] =
      list?.tagName === "UL" ? "ul" : list?.tagName === "OL" ? "ol" : "";
    const listStyle = list ? window.getComputedStyle(list).listStyleType : "";
    const alignment = block ? window.getComputedStyle(block).textAlign : "left";
    const table = anchorElement?.closest("table");
    const activeTable = table instanceof HTMLTableElement && editor.contains(table) ? table : null;
    const activeCommands = Object.fromEntries(
      COMMAND_STATES.map((command) => [command, document.queryCommandState(command)]),
    );
    activeCommands.code = Boolean(anchorElement?.closest("code"));

    setToolbarState({
      blockFormat,
      listType,
      listStyle,
      alignment: alignment === "start" ? "left" : alignment === "end" ? "right" : alignment,
      activeCommands,
      hasSelection: Boolean(selection && !selection.isCollapsed),
      tableRows: activeTable?.rows.length ?? 0,
      tableColumns: activeTable
        ? Math.max(0, ...Array.from(activeTable.rows, (row) => row.cells.length))
        : 0,
    });
  }, [editorRef]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarState);
    return () => document.removeEventListener("selectionchange", updateToolbarState);
  }, [updateToolbarState]);

  return { toolbarState, updateToolbarState };
}
