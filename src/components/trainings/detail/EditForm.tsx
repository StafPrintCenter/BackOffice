import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminTrainingPayload, TrainingLevel, TrainingStatus } from "@/data/trainings";
import { STATUS_OPTIONS, TrainingDetailListField, TrainingDetailProgramField } from "./";

interface Props {
  form: AdminTrainingPayload;
  setForm: (f: AdminTrainingPayload) => void;
  themes: { id: string; name: string }[];
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label>{label}</Label>{children}</div>;
}

export function TrainingDetailEditForm({ form, setForm, themes }: Props) {
  const set = <K extends keyof AdminTrainingPayload>(k: K, v: AdminTrainingPayload[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-4xl space-y-4 rounded-2xl border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre" className="sm:col-span-2"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Thème">
          <Select value={form.theme_id} onValueChange={(v) => set("theme_id", v)}>
            <SelectTrigger><SelectValue placeholder="Choisir un thème" /></SelectTrigger>
            <SelectContent>{themes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Niveau">
          <Select value={form.level} onValueChange={(v) => set("level", v as TrainingLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Débutant">Débutant</SelectItem>
              <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
              <SelectItem value="Avancé">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Durée (libellé)"><Input value={form.duration} onChange={(e) => set("duration", e.target.value)} /></Field>
        <Field label="Durée (heures)"><Input type="number" value={form.duration_hours} onChange={(e) => set("duration_hours", Number(e.target.value))} /></Field>
        <Field label="Prix (FCFA)"><Input type="number" value={form.price} onChange={(e) => set("price", Number(e.target.value))} /></Field>
        <Field label="Places Max (0 = illimité)"><Input type="number" value={form.max_seats ?? 0} onChange={(e) => set("max_seats", Number(e.target.value))} /></Field>
        <Field label="Frais d'inscription (FCFA)"><Input type="number" min={0} value={form.registration_fee ?? 0} onChange={(e) => set("registration_fee", Number(e.target.value))} /></Field>
        <Field label="Ratio d'accès min. (0 à 1)"><Input type="number" min={0} max={1} step={0.05} value={form.access_min_ratio ?? 0} onChange={(e) => set("access_min_ratio", Number(e.target.value))} /></Field>
        <Field label="Statut">
          <Select value={form.status ?? "draft"} onValueChange={(v) => set("status", v as TrainingStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Date limite d'inscription"><Input type="date" value={form.registration_deadline ?? ""} onChange={(e) => set("registration_deadline", e.target.value)} /></Field>
        <Field label="Date de début"><Input type="date" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value)} /></Field>
        <Field label="Date de fin"><Input type="date" value={form.end_date ?? ""} onChange={(e) => set("end_date", e.target.value)} /></Field>
        <Field label="Lieu" className="sm:col-span-2"><Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} /></Field>
        <Field label="Couleur de couverture">
          <div className="flex items-center gap-2">
            <Input value={form.cover_color ?? ""} onChange={(e) => set("cover_color", e.target.value)} placeholder="#8B5CF6" />
            <span className="h-9 w-9 shrink-0 rounded-md border shadow-sm" style={{ backgroundColor: form.cover_color || "transparent" }} />
          </div>
        </Field>
        <div className="flex items-center gap-2 pt-6">
          <input id="waiting_list_enabled_edit" type="checkbox" className="h-4 w-4 rounded border-input" checked={form.waiting_list_enabled ?? false} onChange={(e) => set("waiting_list_enabled", e.target.checked)} />
          <Label htmlFor="waiting_list_enabled_edit">Liste d'attente activée</Label>
        </div>
        <Field label="Public visé" className="sm:col-span-2"><Input value={form.audience} onChange={(e) => set("audience", e.target.value)} /></Field>
        <Field label="Certification" className="sm:col-span-2"><Input value={form.certification} onChange={(e) => set("certification", e.target.value)} /></Field>
        <Field label="Horaires" className="sm:col-span-2"><Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} /></Field>
      </div>
      <Field label="Résumé (short)"><Input value={form.short} onChange={(e) => set("short", e.target.value)} /></Field>
      <TrainingDetailListField label="Objectifs" values={form.objectives} onChange={(v) => set("objectives", v)} />
      <TrainingDetailListField label="Prérequis" values={form.prerequisites} onChange={(v) => set("prerequisites", v)} />
      <TrainingDetailProgramField value={form.program} onChange={(v) => set("program", v)} />
    </div>
  );
}