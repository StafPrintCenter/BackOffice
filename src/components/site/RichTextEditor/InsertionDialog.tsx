import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeHttpUrl } from "./utils";
import type { InsertionMode, InsertionPayload } from "./types";

const EMOJI_AND_SYMBOLS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🙂", "😉", "😊", "😍", "🥰", "😘", "😎", "🤔", "🤗",
  "🥳", "😢", "😭", "😡", "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👋", "✋", "❤️", "🧡", "💛",
  "💚", "💙", "💜", "🖤", "🤍", "💔", "✨", "⭐", "🌟", "🔥", "🎉", "🎊", "💯", "✅", "❌", "⚠️",
  "❓", "❗", "💡", "📌", "📎", "📣", "📧", "📚", "📖", "📝", "💻", "📱", "🎓", "🏆", "🚀", "🌍",
  "☀️", "☁️", "☕", "🍀", "🌱", "🌸", "🎵", "🎶", "©", "®", "™", "€", "$", "£", "¥", "§",
  "¶", "•", "→", "←", "↑", "↓", "↔", "★", "☆", "✓", "✔", "✕", "÷", "±", "∞", "°",
] as const;

const DIALOG_TITLES: Record<InsertionMode, string> = {
  link: "Insérer un lien",
  image: "Insérer une image",
  video: "Insérer une vidéo",
  emoji: "Choisir un emoji ou un symbole",
  table: "Insérer un tableau",
};

interface RichTextInsertionDialogProps {
  mode: InsertionMode | null;
  selectedText: string;
  onOpenChange: (open: boolean) => void;
  onInsert: (payload: InsertionPayload) => void;
}

export function RichTextInsertionDialog({
  mode,
  selectedText,
  onOpenChange,
  onInsert,
}: RichTextInsertionDialogProps) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [alt, setAlt] = useState("");
  const [rows, setRows] = useState("2");
  const [columns, setColumns] = useState("2");
  const [error, setError] = useState("");

  useEffect(() => {
    setUrl("");
    setText(selectedText);
    setAlt("");
    setRows("2");
    setColumns("2");
    setError("");
  }, [mode, selectedText]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (mode === "link" || mode === "image" || mode === "video") {
      const safeUrl = normalizeHttpUrl(url);
      if (!safeUrl) {
        setError("Saisissez une URL complète commençant par http:// ou https://.");
        return;
      }
      if (mode === "link") onInsert({ type: "link", url: safeUrl, text });
      if (mode === "image") onInsert({ type: "image", url: safeUrl, alt });
      if (mode === "video") onInsert({ type: "video", url: safeUrl });
      return;
    }

    if (mode === "table") {
      const rowCount = Number(rows);
      const columnCount = Number(columns);
      if (!Number.isInteger(rowCount) || rowCount < 1 || rowCount > 10) {
        setError("Le nombre de lignes doit être compris entre 1 et 10.");
        return;
      }
      if (!Number.isInteger(columnCount) || columnCount < 1 || columnCount > 10) {
        setError("Le nombre de colonnes doit être compris entre 1 et 10.");
        return;
      }
      onInsert({ type: "table", rows: rowCount, columns: columnCount });
    }
  };

  return (
    <Dialog open={mode !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode ? DIALOG_TITLES[mode] : "Insertion"}</DialogTitle>
          {mode === "emoji" && (
            <DialogDescription>Sélectionnez un emoji ou un symbole pour l’insérer au curseur.</DialogDescription>
          )}
        </DialogHeader>

        {mode === "emoji" ? (
          <div className="grid max-h-[55vh] grid-cols-8 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-10">
            {EMOJI_AND_SYMBOLS.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                title={`Insérer ${item}`}
                onClick={() => onInsert({ type: "emoji", value: item })}
                className="flex h-9 w-9 items-center justify-center rounded-md text-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === "link" || mode === "image" || mode === "video") && (
              <div className="space-y-2">
                <Label htmlFor="rich-text-insertion-url">URL</Label>
                <Input
                  id="rich-text-insertion-url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://"
                  autoFocus
                  required
                />
              </div>
            )}

            {mode === "link" && (
              <div className="space-y-2">
                <Label htmlFor="rich-text-link-text">Texte du lien</Label>
                <Input
                  id="rich-text-link-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Texte sélectionné ou URL"
                />
              </div>
            )}

            {mode === "image" && (
              <div className="space-y-2">
                <Label htmlFor="rich-text-image-alt">Texte alternatif (optionnel)</Label>
                <Input
                  id="rich-text-image-alt"
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                  placeholder="Description de l’image"
                />
              </div>
            )}

            {mode === "table" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="rich-text-table-rows">Lignes (1 à 10)</Label>
                  <Input
                    id="rich-text-table-rows"
                    type="number"
                    min={1}
                    max={10}
                    value={rows}
                    onChange={(event) => setRows(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rich-text-table-columns">Colonnes (1 à 10)</Label>
                  <Input
                    id="rich-text-table-columns"
                    type="number"
                    min={1}
                    max={10}
                    value={columns}
                    onChange={(event) => setColumns(event.target.value)}
                  />
                </div>
              </div>
            )}

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit">Insérer</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
