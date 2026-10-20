import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ACTION_META, type APINotificationActionPreference, type NotificationCategory } from "@/data/notifications";
import { useUpdateActionPreference } from "@/stores/useNotificationsStore";

interface Props {
  category: NotificationCategory;
  actions: APINotificationActionPreference[];
  /** Désactive toute la section (ex. catégorie coupée) */
  disabled?: boolean;
}

export function ActionPreferences({ category, actions, disabled }: Props) {
  const update = useUpdateActionPreference();
  const [state, setState] = useState<Record<string, boolean>>(
    () => Object.fromEntries(actions.map((a) => [a.action, a.enabled])),
  );
  const [pending, setPending] = useState<string | null>(null);

  const toggle = (action: APINotificationActionPreference["action"], enabled: boolean) => {
    setState((s) => ({ ...s, [action]: enabled })); // mise à jour optimiste
    setPending(action);
    update.mutate(
      { category, action, enabled },
      {
        onSuccess: (m) => toast.success(`${ACTION_META[action].label} : ${enabled ? "activées" : "désactivées"}`, { description: m }),
        onError: (e) => {
          setState((s) => ({ ...s, [action]: !enabled })); // retour arrière
          toast.error(e.message);
        },
        onSettled: () => setPending(null),
      },
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Types de notifications reçues</p>
      <ul className="divide-y rounded-lg border">
        {actions.map((a) => {
          const meta = ACTION_META[a.action];
          const isLocked = a.locked;
          return (
            <li key={a.action} className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  {meta.label}
                  {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                </p>
                <p className="text-[11px] text-muted-foreground">{meta.description}</p>
              </div>
              <Switch
                checked={isLocked ? true : (state[a.action] ?? a.enabled)}
                onCheckedChange={(v) => toggle(a.action, v)}
                disabled={isLocked || disabled || pending === a.action}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}