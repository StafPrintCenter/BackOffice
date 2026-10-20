import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ActionFormState {
  actionLabel?: string;
  actionType?: "link" | "route" | "dismiss";
  actionUrl?: string;
  actionTarget?: "_self" | "_blank";
}

interface AnnouncementActionFormProps {
  value: ActionFormState;
  onChange: (updated: ActionFormState) => void;
}

export function AnnouncementActionForm({ value, onChange }: AnnouncementActionFormProps) {
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <Label className="text-xs text-muted-foreground">Bouton d'action (optionnel)</Label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Libellé (ex : En savoir plus)"
          value={value.actionLabel}
          onChange={(e) => onChange({ ...value, actionLabel: e.target.value })}
        />
        <select
          value={value.actionType}
          onChange={(e) => onChange({ ...value, actionType: e.target.value as ActionFormState["actionType"] })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="link">Lien</option>
          <option value="route">Route interne</option>
          <option value="dismiss">Fermer</option>
        </select>
        <Input
          placeholder="URL"
          value={value.actionUrl}
          onChange={(e) => onChange({ ...value, actionUrl: e.target.value })}
        />
        <select
          value={value.actionTarget}
          onChange={(e) => onChange({ ...value, actionTarget: e.target.value as ActionFormState["actionTarget"] })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="_self">Même onglet</option>
          <option value="_blank">Nouvel onglet</option>
        </select>
      </div>
    </div>
  );
}