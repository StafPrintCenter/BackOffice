import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Quote,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { ToolbarButton, ToolbarSeparator } from "./ToolbarParts";
import type { RichTextToolbarState } from "./types";

const TEXT_ACTIONS: Array<{ icon: LucideIcon; command: string; label: string }> = [
  { icon: Bold, command: "bold", label: "Gras" },
  { icon: Italic, command: "italic", label: "Italique" },
  { icon: Underline, command: "underline", label: "Souligné" },
  { icon: Strikethrough, command: "strikeThrough", label: "Barré" },
  { icon: Subscript, command: "subscript", label: "Indice" },
  { icon: Superscript, command: "superscript", label: "Exposant" },
];

const ALIGN_ACTIONS: Array<{ icon: LucideIcon; command: string; label: string; value: string }> = [
  { icon: AlignLeft, command: "justifyLeft", label: "Aligner à gauche", value: "left" },
  { icon: AlignCenter, command: "justifyCenter", label: "Centrer", value: "center" },
  { icon: AlignRight, command: "justifyRight", label: "Aligner à droite", value: "right" },
  { icon: AlignJustify, command: "justifyFull", label: "Justifier", value: "justify" },
];

interface FormattingControlsProps {
  state: RichTextToolbarState;
  onBeforeAction: () => void;
  onCommand: (command: string, value?: string) => void;
  onTextColor: (color: string) => void;
}

export function FormattingControls({
  state,
  onBeforeAction,
  onCommand,
  onTextColor,
}: FormattingControlsProps) {
  return (
    <>
      {TEXT_ACTIONS.map(({ icon, command, label }) => (
        <ToolbarButton
          key={command}
          icon={icon}
          label={label}
          active={state.activeCommands[command]}
          onMouseDown={onBeforeAction}
          onClick={() => onCommand(command)}
        />
      ))}
      <ToolbarButton
        icon={Quote}
        label="Citation"
        active={state.blockFormat === "blockquote"}
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

      <ToolbarSeparator />
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
      {ALIGN_ACTIONS.map(({ icon, command, label, value }) => (
        <ToolbarButton
          key={command}
          icon={icon}
          label={label}
          active={state.alignment === value}
          onMouseDown={onBeforeAction}
          onClick={() => onCommand(command)}
        />
      ))}
    </>
  );
}
