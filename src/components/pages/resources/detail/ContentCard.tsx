import { FileText } from "lucide-react";
import { ResourceFormFields, type ResourceFormValues } from "../home/FormFields";

export function ResourceContentCard({
  isEditing,
  form,
  onChangeForm,
  errors,
  fileName,
}: {
  isEditing: boolean;
  form: ResourceFormValues;
  onChangeForm: (form: ResourceFormValues) => void;
  errors?: Record<string, string>;
  fileName?: string | null;
}) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Informations de la ressource</h2>
      </div>
      {isEditing ? (
        <div className="mt-5">
          <ResourceFormFields
            form={form}
            onChange={onChangeForm}
            errors={errors}
            currentFileName={fileName}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Titre</p>
            <h1 className="mt-1 font-display text-2xl font-bold">{form.title}</h1>
            <p className="font-mono text-xs text-primary">{form.slug || "Slug généré automatiquement"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Description courte</p>
            <p className="mt-1 text-sm">{form.short}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Description détaillée</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{form.description}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <List label="Contenu inclus" value={form.includes} />
            <List label="Résultats" value={form.outcomes} />
            <Text label="Public cible" value={form.audience} />
            <List label="Prérequis" value={form.requirements} />
            <Text label="Licence" value={form.license} />
          </div>
        </div>
      )}
    </section>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{value || "—"}</p>
    </div>
  );
}

function List({ label, value }: { label: string; value: string }) {
  const items = value.split("\n").map((item) => item.trim()).filter(Boolean);
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {items.length > 0 ? (
        <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : <p className="mt-1 text-sm">—</p>}
    </div>
  );
}
