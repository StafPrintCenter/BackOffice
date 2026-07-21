import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link2, Heading2, Quote, Undo, Redo } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

const TOOLBAR_ACTIONS: Array<{ icon: typeof Bold; command: string; label: string; arg?: string }> = [
  { icon: Bold, command: "bold", label: "Gras" },
  { icon: Italic, command: "italic", label: "Italique" },
  { icon: Underline, command: "underline", label: "Souligné" },
  { icon: Heading2, command: "formatBlock", label: "Titre", arg: "h2" },
  { icon: Quote, command: "formatBlock", label: "Citation", arg: "blockquote" },
  { icon: List, command: "insertUnorderedList", label: "Liste à puces" },
  { icon: ListOrdered, command: "insertOrderedList", label: "Liste numérotée" },
];

export function RichTextEditor({ value, onChange, placeholder, minHeightClassName = "min-h-[280px]" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Ne réinjecte le HTML externe que s'il diffère réellement de ce que l'éditeur
  // contient déjà, pour éviter de faire sauter le curseur pendant la frappe.
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const url = window.prompt("URL du lien :");
    if (url) exec("createLink", url);
  };

  return (
    <div className="rounded-lg border border-input overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1.5">
        {TOOLBAR_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            title={a.label}
            onClick={() => exec(a.command, a.arg)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
          >
            <a.icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Lien"
          onClick={handleLink}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          title="Annuler"
          onClick={() => exec("undo")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Rétablir"
          onClick={() => exec("redo")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        className={`prose prose-sm max-w-none overflow-y-auto bg-background px-4 py-3 text-sm outline-none ${minHeightClassName} empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
      />
    </div>
  );
}