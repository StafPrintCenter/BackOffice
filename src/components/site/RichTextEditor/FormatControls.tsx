import { TOOLBAR_SELECT_CLASS } from "./ToolbarParts";
import type { RichTextToolbarState } from "./types";

interface BlockFormatControlsProps {
  state: RichTextToolbarState;
  onBeforeAction: () => void;
  onCommand: (command: string, value?: string) => void;
  onListStyle: (ordered: boolean, style: string) => void;
}

export function BlockFormatControls({
  state,
  onBeforeAction,
  onCommand,
  onListStyle,
}: BlockFormatControlsProps) {
  return (
    <>
      <select
        aria-label="Style du paragraphe"
        title="Paragraphe ou titre"
        value={state.blockFormat}
        onMouseDown={onBeforeAction}
        onChange={(event) => onCommand("formatBlock", event.target.value)}
        className={TOOLBAR_SELECT_CLASS}
      >
        <option value="p">Paragraphe</option>
        <option value="h1">Titre 1</option>
        <option value="h2">Titre 2</option>
        <option value="h3">Titre 3</option>
        <option value="h4">Titre 4</option>
        <option value="h5">Titre 5</option>
        <option value="h6">Titre 6</option>
        <option value="blockquote">Citation</option>
        <option value="pre">Bloc de code</option>
      </select>

      <select
        aria-label="Style de liste à puces"
        title="Liste à puces"
        value={state.listType === "ul" ? state.listStyle : ""}
        onMouseDown={onBeforeAction}
        onChange={(event) => {
          if (event.target.value) onListStyle(false, event.target.value);
        }}
        className={TOOLBAR_SELECT_CLASS}
      >
        <option value="">Puces</option>
        <option value="disc">Disque</option>
        <option value="square">Carré</option>
        <option value="circle">Cercle</option>
      </select>

      <select
        aria-label="Style de numérotation"
        title="Liste numérotée"
        value={state.listType === "ol" ? state.listStyle : ""}
        onMouseDown={onBeforeAction}
        onChange={(event) => {
          if (event.target.value) onListStyle(true, event.target.value);
        }}
        className={TOOLBAR_SELECT_CLASS}
      >
        <option value="">Numérotation</option>
        <option value="decimal">1, 2, 3</option>
        <option value="lower-alpha">a, b, c</option>
        <option value="upper-alpha">A, B, C</option>
        <option value="lower-roman">i, ii, iii</option>
        <option value="upper-roman">I, II, III</option>
      </select>
    </>
  );
}
