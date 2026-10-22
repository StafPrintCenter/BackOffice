import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eraser, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCleanupSettings, useUpdateCleanupSettings } from "@/stores/useNotificationsStore";

function CleanupForm({ onClose }: { onClose: () => void }) {
  const { settings, isLoading, isError } = useCleanupSettings();
  const update = useUpdateCleanupSettings();

  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState(7);
  const [includeUnread, setIncludeUnread] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setEnabled(settings.enabled);
    setDays(settings.days);
    setIncludeUnread(settings.includeUnread);
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  if (isError || !settings) {
    return <p className="py-6 text-center text-sm text-destructive">Impossible de charger les réglages.</p>;
  }

  const min = settings.minDays ?? 1;
  const max = settings.maxDays ?? 365;
  const presets = settings.presets ?? [1, 3, 7, 14, 30];

  const save = () => {
    if (!Number.isInteger(days) || days < min || days > max) {
      return setError(`Choisissez une durée entre ${min} et ${max} jours.`);
    }
    setError(null);
    update.mutate(
      { enabled, days, includeUnread },
      {
        onSuccess: (m) => { toast.success(m); onClose(); },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Activer le nettoyage automatique</p>
            <p className="text-xs text-muted-foreground">
              Exécuté chaque nuit.{settings.isDefault && ` Par défaut : ${settings.defaultDays ?? 7} jours.`}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div>
              <p className="mb-1.5 text-xs font-medium">Supprimer les notifications de plus de</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {presets.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${days === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                      }`}
                  >
                    {d} j
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                ou
                <Input
                  type="number" min={min} max={max} value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-8 w-20"
                />
                jours ({min} à {max})
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input type="checkbox" className="mt-0.5" checked={includeUnread} onChange={(e) => setIncludeUnread(e.target.checked)} />
              <span>
                Inclure les notifications <b>non lues</b>
                <span className="block text-muted-foreground">Sinon, seules les notifications déjà lues sont supprimées.</span>
              </span>
            </label>
          </>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
          Enregistrer
        </Button>
      </DialogFooter>
    </>
  );
}

interface CleanupSettingsDialogProps {
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default";
}

/** Bouton déclencheur + modale. À poser tel quel dans n'importe quelle page. */
export function CleanupSettingsDialog({ label = "Nettoyage auto", variant = "outline", size = "sm" }: CleanupSettingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Eraser className="mr-1 h-4 w-4" /> {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eraser className="h-4 w-4" /> Nettoyage automatique</DialogTitle>
            <DialogDescription>Supprime automatiquement vos anciennes notifications.</DialogDescription>
          </DialogHeader>
          <CleanupForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}