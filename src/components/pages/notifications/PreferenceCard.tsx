import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, WEEKDAYS, type APINotificationPreference, type DeliveryMode } from "@/data/notifications";
import { useUpdatePreference } from "@/stores/useNotificationsStore";
import { ActionPreferences } from "./";

const hhmm = (t: string | null, fallback: string) => (t ? t.slice(0, 5) : fallback);

export function PreferenceCard({ preference: p }: { preference: APINotificationPreference }) {
  const meta = CATEGORY_META[p.category];
  const Icon = meta.icon;
  const update = useUpdatePreference();

  const [enabled, setEnabled] = useState(p.enabled);
  const [mode, setMode] = useState<DeliveryMode>(p.deliveryMode);
  const [days, setDays] = useState<number[]>(p.scheduleDays.length ? p.scheduleDays : [1, 2, 3, 4, 5]);
  const [start, setStart] = useState(hhmm(p.scheduleStartTime, "08:00"));
  const [end, setEnd] = useState(hhmm(p.scheduleEndTime, "18:00"));
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (d: number) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const save = () => {
    setError(null);
    if (mode === "scheduled") {
      if (days.length === 0) return setError("Choisissez au moins un jour.");
      if (end <= start) return setError("L'heure de fin doit être postérieure à l'heure de début.");
    }
    update.mutate(
      mode === "scheduled"
        ? { category: p.category, enabled, deliveryMode: mode, scheduleDays: days, scheduleStartTime: start, scheduleEndTime: end }
        : { category: p.category, enabled, deliveryMode: mode },
      {
        onSuccess: () => toast.success(`Préférence « ${meta.label} » enregistrée`),
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.className}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold">{meta.label}</h3>
            {p.locked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Lock className="h-3 w-3" /> Verrouillée
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <Switch checked={p.locked ? true : enabled} onCheckedChange={setEnabled} disabled={p.locked} />
      </div>

      {!p.locked && enabled && (
        <div className="mt-5 space-y-4 border-t pt-4">
          <div className="flex gap-2">
            {(["instant", "scheduled"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-medium transition ${mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
                  }`}
              >
                {m === "instant" ? "Instantané" : "Programmé"}
              </button>
            ))}
          </div>

          {mode === "scheduled" && (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium">Jours de réception</p>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => toggleDay(d.value)}
                      className={`h-8 w-11 cursor-pointer rounded-md border text-xs font-medium transition ${days.includes(d.value) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                        }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-2">
                  De <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-md border bg-background px-2 py-1" />
                </label>
                <label className="flex items-center gap-2">
                  à <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-md border bg-background px-2 py-1" />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {(p.locked || enabled) && p.actions?.length > 0 && (
        <div className="mt-5 border-t pt-4">
          <ActionPreferences category={p.category} actions={p.actions} />
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      {!p.locked && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={save} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
}