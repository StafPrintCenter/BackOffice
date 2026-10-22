import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eraser, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCleanupSettings, useUpdateCleanupSettings } from "@/stores/useNotificationsStore";

export function CleanupSettingsCard() {
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

  if (isLoading) return <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Chargement…</div>;
  if (isError || !settings) return <div className="rounded-2xl border bg-card p-5 text-sm text-destructive">Impossible de charger les réglages de nettoyage.</div>;

  const min = settings.minDays ?? 1;
  const max = settings.maxDays ?? 365;
  const presets = settings.presets ?? [1, 3, 7, 14, 30];

  const save = () => {
    if (!Number.isInteger(days) || days < min || days > max) return setError(`Choisissez une durée entre ${min} et ${max} jours.`);
    setError(null);
    update.mutate({ enabled, days, includeUnread }, {
      onSuccess: (m) => toast.success(m),
      onError: (e) => setError(e.message),
    });
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Eraser className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold">Nettoyage automatique</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chaque nuit, les notifications plus anciennes que la durée choisie sont supprimées.
            {settings.isDefault && ` Valeur par défaut : ${settings.defaultDays ?? 7} jours.`}
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <div className="mt-5 space-y-4 border-t pt-4">
          <div>
            <p className="mb-1.5 text-xs font-medium">Supprimer après</p>
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
              <span className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                ou
                <Input
                  type="number" min={min} max={max} value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-8 w-20"
                />
                jours
              </span>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-xs">
            <input type="checkbox" className="mt-0.5" checked={includeUnread} onChange={(e) => setIncludeUnread(e.target.checked)} />
            <span>
              Inclure les notifications <b>non lues</b>
              <span className="block text-muted-foreground">Sinon, seules les notifications déjà lues sont supprimées.</span>
            </span>
          </label>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={save} disabled={update.isPending}>
          {update.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}