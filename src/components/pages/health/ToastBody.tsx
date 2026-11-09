interface HealthToastBodyProps {
  message: string;
  dismissLabel?: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const BUTTON_BASE =
  "inline-flex h-7 cursor-pointer items-center rounded-md px-2.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Message puis rangée de boutons en dessous : « Masquer » d'abord, l'action ensuite */
export function HealthToastBody({ message, dismissLabel = "Masquer", onDismiss, actionLabel, onAction }: HealthToastBodyProps) {
  const hasButtons = !!onDismiss || (!!onAction && !!actionLabel);

  return (
    <div className="mt-1 space-y-3">
      <p className="text-sm leading-snug">{message}</p>

      {hasButtons && (
        <div className="flex flex-wrap gap-2">
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className={`${BUTTON_BASE} bg-foreground/10 hover:bg-foreground/20`}
            >
              {dismissLabel}
            </button>
          )}
          {onAction && actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className={`${BUTTON_BASE} bg-foreground text-background hover:bg-foreground/90`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}