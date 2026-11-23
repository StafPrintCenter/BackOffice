import { useEffect, useRef } from "react";
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
  List,
  ListOrdered,
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

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
}

const TOOLBAR_ACTIONS: Array<{ icon: LucideIcon; command: string; label: string }> = [
  { icon: Bold, command: "bold", label: "Gras" },
  { icon: Italic, command: "italic", label: "Italique" },
  { icon: Underline, command: "underline", label: "Souligné" },
  { icon: Strikethrough, command: "strikeThrough", label: "Barré" },
  { icon: Subscript, command: "subscript", label: "Indice" },
  { icon: Superscript, command: "superscript", label: "Exposant" },
  { icon: Quote, command: "formatBlock", label: "Citation" },
  { icon: IndentDecrease, command: "outdent", label: "Diminuer le retrait" },
  { icon: IndentIncrease, command: "indent", label: "Augmenter le retrait" },
  { icon: AlignLeft, command: "justifyLeft", label: "Aligner à gauche" },
  { icon: AlignCenter, command: "justifyCenter", label: "Centrer" },
  { icon: AlignRight, command: "justifyRight", label: "Aligner à droite" },
  { icon: AlignJustify, command: "justifyFull", label: "Justifier" },
];

const BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground";
const SELECT_CLASS =
  "h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground";

function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function createVideoHtml(value: string): string | null {
  const safeUrl = safeHttpUrl(value);
  if (!safeUrl) return null;

  const url = new URL(safeUrl);
  const host = url.hostname.toLowerCase();
  let embedUrl: string | null = null;

  if (
    host === "youtu.be" ||
    ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)
  ) {
    const videoId =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") ?? url.pathname.match(/\/(?:embed|shorts)\/([^/]+)/)?.[1];
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  } else if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const videoId = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  if (embedUrl) {
    return `<iframe src="${escapeAttribute(embedUrl)}" title="Vidéo intégrée" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  }

  return `<video controls playsinline src="${escapeAttribute(safeUrl)}"></video>`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[280px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    const range = savedRange.current;
    if (range && editor.contains(range.commonAncestorContainer)) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    onChange(editorRef.current.innerHTML);
    saveSelection();
  };

  const activeList = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const list = element?.closest("ul, ol");
    return editor && list && editor.contains(list) ? (list as HTMLOListElement | HTMLUListElement) : null;
  };

  const exec = (command: string, arg?: string) => {
    restoreSelection();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const applyListStyle = (ordered: boolean, style: string) => {
    restoreSelection();
    const expectedTag = ordered ? "OL" : "UL";
    if (activeList()?.tagName !== expectedTag) {
      document.execCommand(ordered ? "insertOrderedList" : "insertUnorderedList");
    }
    const list = activeList();
    if (list?.tagName === expectedTag) list.style.listStyleType = style;
    handleInput();
  };

  const insertHtml = (html: string) => {
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    handleInput();
  };

  const handleLink = () => {
    const input = window.prompt("URL du lien :");
    if (input === null) return;
    const url = safeHttpUrl(input);
    if (!url) {
      window.alert("Veuillez saisir une URL HTTP ou HTTPS valide.");
      return;
    }
    exec("createLink", url);
  };

  const handleImage = () => {
    const input = window.prompt("URL de l’image :");
    if (input === null) return;
    const url = safeHttpUrl(input);
    if (!url) {
      window.alert("Veuillez saisir une URL HTTP ou HTTPS valide.");
      return;
    }
    insertHtml(`<img src="${escapeAttribute(url)}" alt="">`);
  };

  const handleVideo = () => {
    const input = window.prompt("URL de la vidéo :");
    if (input === null) return;
    const html = createVideoHtml(input);
    if (!html) {
      window.alert("Veuillez saisir une URL HTTP ou HTTPS valide.");
      return;
    }
    insertHtml(html);
  };

  const handleTable = () => {
    const rowInput = window.prompt("Nombre de lignes (1 à 10) :", "2");
    if (rowInput === null) return;
    const rows = Number(rowInput);
    if (!Number.isInteger(rows) || rows < 1 || rows > 10) {
      window.alert("Le nombre de lignes doit être compris entre 1 et 10.");
      return;
    }
    const columnInput = window.prompt("Nombre de colonnes (1 à 10) :", "2");
    if (columnInput === null) return;
    const columns = Number(columnInput);
    if (!Number.isInteger(columns) || columns < 1 || columns > 10) {
      window.alert("Le nombre de colonnes doit être compris entre 1 et 10.");
      return;
    }

    const tableRows = Array.from({ length: rows }, () =>
      `<tr>${Array.from({ length: columns }, () => "<td><br></td>").join("")}</tr>`,
    ).join("");
    insertHtml(`<table><tbody>${tableRows}</tbody></table><p><br></p>`);
  };

  const clearFormatting = () => {
    restoreSelection();
    const listTag = activeList()?.tagName;
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    document.execCommand("justifyLeft");
    if (listTag === "UL") document.execCommand("insertUnorderedList");
    if (listTag === "OL") document.execCommand("insertOrderedList");
    document.execCommand("formatBlock", false, "p");
    handleInput();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <div
        role="toolbar"
        aria-label="Mise en forme du texte"
        className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1.5"
      >
        <select
          aria-label="Style du paragraphe"
          title="Paragraphe ou titre"
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={(event) => {
            if (event.target.value) exec("formatBlock", event.target.value);
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
          onMouseDown={saveSelection}
          onChange={(event) => {
            if (event.target.value) applyListStyle(false, event.target.value);
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
          onMouseDown={saveSelection}
          onChange={(event) => {
            if (event.target.value) applyListStyle(true, event.target.value);
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

        <div className="mx-1 h-5 w-px bg-border" />

        {TOOLBAR_ACTIONS.slice(0, 7).map(({ icon: Icon, command, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={saveSelection}
            onClick={() => exec(command, command === "formatBlock" ? "blockquote" : undefined)}
            className={BUTTON_CLASS}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <label
          title="Couleur du texte"
          className="relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-xs font-bold text-muted-foreground hover:bg-accent"
        >
          A
          <input
            type="color"
            aria-label="Couleur du texte"
            onMouseDown={saveSelection}
            onChange={(event) => exec("foreColor", event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>

        {TOOLBAR_ACTIONS.slice(7).map(({ icon: Icon, command, label }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={saveSelection}
            onClick={() => exec(command)}
            className={BUTTON_CLASS}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-border" />

        <button type="button" title="Lien" aria-label="Lien" onMouseDown={saveSelection} onClick={handleLink} className={BUTTON_CLASS}>
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" title="Image par URL" aria-label="Image par URL" onMouseDown={saveSelection} onClick={handleImage} className={BUTTON_CLASS}>
          <Image className="h-4 w-4" />
        </button>
        <button type="button" title="Vidéo par URL" aria-label="Vidéo par URL" onMouseDown={saveSelection} onClick={handleVideo} className={BUTTON_CLASS}>
          <Video className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Insérer un emoji ou un symbole"
          aria-label="Insérer un emoji ou un symbole"
          onMouseDown={saveSelection}
          onClick={() => {
            const text = window.prompt("Emoji ou symbole à insérer :", "😊");
            if (text) exec("insertText", text);
          }}
          className={BUTTON_CLASS}
        >
          <Smile className="h-4 w-4" />
        </button>
        <button type="button" title="Ajouter un tableau" aria-label="Ajouter un tableau" onMouseDown={saveSelection} onClick={handleTable} className={BUTTON_CLASS}>
          <Table2 className="h-4 w-4" />
        </button>
        <button type="button" title="Effacer le formatage" aria-label="Effacer le formatage" onMouseDown={saveSelection} onClick={clearFormatting} className={BUTTON_CLASS}>
          <Eraser className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-border" />
        <button type="button" title="Annuler" aria-label="Annuler" onMouseDown={saveSelection} onClick={() => exec("undo")} className={BUTTON_CLASS}>
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" title="Rétablir" aria-label="Rétablir" onMouseDown={saveSelection} onClick={() => exec("redo")} className={BUTTON_CLASS}>
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        data-placeholder={placeholder}
        className={`prose prose-sm max-w-none overflow-y-auto bg-background px-4 py-3 text-sm outline-none ${minHeightClassName} empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]`}
      />
    </div>
  );
}
