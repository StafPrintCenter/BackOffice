import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Image,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  Quote,
  Redo,
  Smile,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Underline,
  Undo,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { InsertionMode } from "./types";

interface RichTextToolbarProps {
  onBeforeAction: () => void;
  onCommand: (command: string, value?: string) => void;
  onListStyle: (ordered: boolean, style: string) => void;
  onTextColor: (color: string) => void;
  onInsert: (mode: InsertionMode) => void;
  onClearFormatting: () => void;
}

const FORMAT_ACTIONS: Array<{ icon: LucideIcon; command: string; label: string }> = [
  { icon: Bold, command: "bold", label: "Gras" },
  { icon: Italic, command: "italic", label: "Italique" },
  { icon: Underline, command: "underline", label: "Souligné" },
  { icon: Strikethrough, command: "strikeThrough", label: "Barré" },
  { icon: Subscript, command: "subscript", label: "Indice" },
  { icon: Superscript, command: "superscript", label: "Exposant" },
];

const ALIGN_ACTIONS: Array<{ icon: LucideIcon; command: string; label: string }> = [
  { icon: AlignLeft, command: "justifyLeft", label: "Aligner à gauche" },
  { icon: AlignCenter, command: "justifyCenter", label: "Centrer" },
  { icon: AlignRight, command: "justifyRight", label: "Aligner à droite" },
  { icon: AlignJustify, command: "justifyFull", label: "Justifier" },
];

const BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer";
const SELECT_CLASS =
  "h-8 max-w-36 rounded-md border border-input bg-background px-2 text-xs text-foreground";

function Separator() {
  return <div aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

function ToolbarButton({
  icon: Icon,
  label,
  onMouseDown,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onMouseDown: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={BUTTON_CLASS}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function RichTextToolbar({
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
      <select
        aria-label="Style du paragraphe"
        title="Paragraphe ou titre"
        defaultValue=""
        onMouseDown={onBeforeAction}
        onChange={(event) => {
          if (event.target.value) onCommand("formatBlock", event.target.value);
          event.target.value = "";
        }}
        className={SELECT_CLASS}
      >
        <option value="" disabled>Paragraphe / titre</option>
        <option value="p">Paragraphe</option>
        <option value="h1">Titre 1</option>
        <option value="h2">Titre 2</option>
        <option value="h3">Titre 3</option>
        <option value="h4">Titre 4</option>
        <option value="h5">Titre 5</option>
        <option value="h6">Titre 6</option>
      </select>

      <select
        aria-label="Style de liste à puces"
        title="Liste à puces"
        defaultValue=""
        onMouseDown={onBeforeAction}
        onChange={(event) => {
          if (event.target.value) onListStyle(false, event.target.value);
          event.target.value = "";
        }}
        className={SELECT_CLASS}
      >
        <option value="" disabled>Puces</option>
        <option value="disc">Disque</option>
        <option value="square">Carré</option>
        <option value="circle">Cercle</option>
      </select>

      <select
        aria-label="Style de numérotation"
        title="Liste numérotée"
        defaultValue=""
        onMouseDown={onBeforeAction}
        onChange={(event) => {
          if (event.target.value) onListStyle(true, event.target.value);
          event.target.value = "";
        }}
        className={SELECT_CLASS}
      >
        <option value="" disabled>Numérotation</option>
        <option value="decimal">1, 2, 3</option>
        <option value="lower-alpha">a, b, c</option>
        <option value="upper-alpha">A, B, C</option>
        <option value="lower-roman">i, ii, iii</option>
        <option value="upper-roman">I, II, III</option>
      </select>

      <Separator />

      {FORMAT_ACTIONS.map(({ icon, command, label }) => (
        <ToolbarButton
          key={command}
          icon={icon}
          label={label}
          onMouseDown={onBeforeAction}
          onClick={() => onCommand(command)}
        />
      ))}
      <ToolbarButton
        icon={Quote}
        label="Citation"
        onMouseDown={onBeforeAction}
        onClick={() => onCommand("formatBlock", "blockquote")}
      />

      <label
        title="Couleur du texte"
        className="relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-xs font-bold text-muted-foreground hover:bg-accent"
      >
        A
        <input
          type="color"
          aria-label="Couleur du texte"
          onMouseDown={onBeforeAction}
          onChange={(event) => onTextColor(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <Separator />
      <ToolbarButton
        icon={IndentDecrease}
        label="Diminuer le retrait"
        onMouseDown={onBeforeAction}
        onClick={() => onCommand("outdent")}
      />
      <ToolbarButton
        icon={IndentIncrease}
        label="Augmenter le retrait"
        onMouseDown={onBeforeAction}
        onClick={() => onCommand("indent")}
      />
      {ALIGN_ACTIONS.map(({ icon, command, label }) => (
        <ToolbarButton
          key={command}
          icon={icon}
          label={label}
          onMouseDown={onBeforeAction}
          onClick={() => onCommand(command)}
        />
      ))}

      <Separator />
      <ToolbarButton icon={Link2} label="Lien" onMouseDown={onBeforeAction} onClick={() => onInsert("link")} />
      <ToolbarButton icon={Image} label="Image par URL" onMouseDown={onBeforeAction} onClick={() => onInsert("image")} />
      <ToolbarButton icon={Video} label="Vidéo par URL" onMouseDown={onBeforeAction} onClick={() => onInsert("video")} />
      <ToolbarButton icon={Smile} label="Emoji ou symbole" onMouseDown={onBeforeAction} onClick={() => onInsert("emoji")} />
      <ToolbarButton icon={Table2} label="Ajouter un tableau" onMouseDown={onBeforeAction} onClick={() => onInsert("table")} />
      <ToolbarButton
        icon={Eraser}
        label="Effacer le formatage"
        onMouseDown={onBeforeAction}
        onClick={onClearFormatting}
      />
      <Separator />
      <ToolbarButton icon={Undo} label="Annuler" onMouseDown={onBeforeAction} onClick={() => onCommand("undo")} />
      <ToolbarButton icon={Redo} label="Rétablir" onMouseDown={onBeforeAction} onClick={() => onCommand("redo")} />
    </div>
  );
}
