import type { InsertionPayload } from "./types";

const EMOJI_AND_SYMBOLS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🙂", "😉", "😊", "😍", "🥰", "😘", "😎", "🤔", "🤗",
  "🥳", "😢", "😭", "😡", "👍", "👎", "👏", "🙌", "🙏", "💪", "🤝", "👋", "✋", "❤️", "🧡", "💛",
  "💚", "💙", "💜", "🖤", "🤍", "💔", "✨", "⭐", "🌟", "🔥", "🎉", "🎊", "💯", "✅", "❌", "⚠️",
  "❓", "❗", "💡", "📌", "📎", "📣", "📧", "📚", "📖", "📝", "💻", "📱", "🎓", "🏆", "🚀", "🌍",
  "☀️", "☁️", "☕", "🍀", "🌱", "🌸", "🎵", "🎶", "©", "®", "™", "€", "$", "£", "¥", "§",
  "¶", "•", "→", "←", "↑", "↓", "↔", "★", "☆", "✓", "✔", "✕", "÷", "±", "∞", "°",
] as const;

export function EmojiPicker({ onSelect }: { onSelect: (payload: InsertionPayload) => void }) {
  return (
    <div className="grid max-h-[55vh] grid-cols-8 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-10">
      {EMOJI_AND_SYMBOLS.map((item, index) => (
        <button
          key={`${item}-${index}`}
          type="button"
          title={`Insérer ${item}`}
          onClick={() => onSelect({ type: "emoji", value: item })}
          className="flex h-9 w-9 items-center justify-center rounded-md text-xl hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
