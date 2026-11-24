import type { LucideIcon } from "lucide-react";

export const TOOLBAR_BUTTON_CLASS =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer";
export const TOOLBAR_BUTTON_ACTIVE_CLASS =
  "bg-accent text-accent-foreground ring-1 ring-border";
export const TOOLBAR_SELECT_CLASS =
  "h-8 max-w-36 rounded-md border border-input bg-background px-2 text-xs text-foreground";

export function ToolbarSeparator() {
  return <div aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

export function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  onMouseDown,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onMouseDown: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`${TOOLBAR_BUTTON_CLASS} ${active ? TOOLBAR_BUTTON_ACTIVE_CLASS : ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
