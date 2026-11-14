import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESOURCE_CATEGORIES, type ResourceCategory } from "@/data/resources";

export interface ResourceFormValues {
  slug: string;
  title: string;
  category: ResourceCategory;
  price: string;
  originalPrice: string;
  status: string;
  short: string;
  description: string;
  format: string;
  meta: string;
  includes: string;
  outcomes: string;
  audience: string;
  requirements: string;
  license: string;
  file: File | null;
}

export const EMPTY_RESOURCE_FORM: ResourceFormValues = {
  slug: "",
  title: "",
  category: "Gabarit",
  price: "0",
  originalPrice: "",
  status: "",
  short: "",
  description: "",
  format: "",
  meta: "",
  includes: "",
  outcomes: "",
  audience: "",
  requirements: "",
  license: "",
  file: null,
};

interface ResourceFormFieldsProps {
  form: ResourceFormValues;
  onChange: (form: ResourceFormValues) => void;
  errors?: Record<string, string>;
  fileRequired?: boolean;
  disabled?: boolean;
  currentFileName?: string | null;
}

export function ResourceFormFields({
  form,
  onChange,
  errors = {},
  fileRequired = false,
  disabled = false,
  currentFileName,
}: ResourceFormFieldsProps) {
  const set = <K extends keyof ResourceFormValues>(key: K, value: ResourceFormValues[K]) =>
    onChange({ ...form, [key]: value });
  const fileChanged = (event: ChangeEvent<HTMLInputElement>) => {
    set("file", event.target.files?.[0] ?? null);
    event.target.value = "";
  };
  const error = (key: string) =>
    errors[key] ? <p className="mt-1 text-xs text-destructive">{errors[key]}</p> : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="resource-title">Titre</Label>
          <Input id="resource-title" value={form.title} maxLength={255} onChange={(e) => set("title", e.target.value)} disabled={disabled} />
          {error("title")}
        </div>
        <div>
          <Label htmlFor="resource-slug">Slug (facultatif, généré automatiquement sinon)</Label>
          <Input id="resource-slug" value={form.slug} maxLength={200} onChange={(e) => set("slug", e.target.value)} disabled={disabled} />
          {error("slug")}
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select value={form.category} onValueChange={(value) => set("category", value as ResourceCategory)} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RESOURCE_CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
          {error("category")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="resource-price">Prix (FCFA)</Label>
            <Input id="resource-price" type="number" min="0" step="1" value={form.price} onChange={(e) => set("price", e.target.value)} disabled={disabled} />
            {error("price")}
          </div>
          <div>
            <Label htmlFor="resource-original-price">Ancien prix</Label>
            <Input id="resource-original-price" type="number" min="0" step="1" value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} disabled={disabled} />
            {error("originalPrice")}
          </div>
        </div>
        <div>
          <Label htmlFor="resource-status">Statut descriptif</Label>
          <Input id="resource-status" value={form.status} maxLength={100} onChange={(e) => set("status", e.target.value)} disabled={disabled} />
          {error("status")}
        </div>
        <div>
          <Label htmlFor="resource-format">Format</Label>
          <Input id="resource-format" value={form.format} maxLength={255} onChange={(e) => set("format", e.target.value)} disabled={disabled} />
          {error("format")}
        </div>
        <div>
          <Label htmlFor="resource-meta">Métadonnées</Label>
          <Input id="resource-meta" value={form.meta} maxLength={255} onChange={(e) => set("meta", e.target.value)} disabled={disabled} />
          {error("meta")}
        </div>
        <div>
          <Label htmlFor="resource-short">Description courte</Label>
          <Textarea id="resource-short" value={form.short} maxLength={1000} onChange={(e) => set("short", e.target.value)} disabled={disabled} />
          {error("short")}
        </div>
      </div>

      <div>
        <Label htmlFor="resource-description">Description détaillée</Label>
        <Textarea id="resource-description" value={form.description} maxLength={20000} rows={5} onChange={(e) => set("description", e.target.value)} disabled={disabled} />
        {error("description")}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="resource-includes">Contenu inclus (un élément par ligne)</Label>
          <Textarea id="resource-includes" value={form.includes} rows={4} onChange={(e) => set("includes", e.target.value)} disabled={disabled} />
          {error("includes")}
        </div>
        <div>
          <Label htmlFor="resource-outcomes">Résultats (un par ligne)</Label>
          <Textarea id="resource-outcomes" value={form.outcomes} rows={4} onChange={(e) => set("outcomes", e.target.value)} disabled={disabled} />
          {error("outcomes")}
        </div>
        <div>
          <Label htmlFor="resource-audience">Public cible</Label>
          <Textarea id="resource-audience" value={form.audience} maxLength={5000} rows={3} onChange={(e) => set("audience", e.target.value)} disabled={disabled} />
          {error("audience")}
        </div>
        <div>
          <Label htmlFor="resource-requirements">Prérequis (un par ligne)</Label>
          <Textarea id="resource-requirements" value={form.requirements} rows={3} onChange={(e) => set("requirements", e.target.value)} disabled={disabled} />
          {error("requirements")}
        </div>
      </div>

      <div>
        <Label htmlFor="resource-license">Licence d'utilisation</Label>
        <Textarea id="resource-license" value={form.license} maxLength={10000} rows={3} onChange={(e) => set("license", e.target.value)} disabled={disabled} />
        {error("license")}
      </div>

      <div>
        <Label htmlFor="resource-file">Fichier {fileRequired ? "(obligatoire)" : "(facultatif)"}</Label>
        {currentFileName && <p className="mb-1 text-xs text-muted-foreground">Fichier actuel : {currentFileName}</p>}
        <Input id="resource-file" type="file" accept=".pdf,.ai,.psd,.indd,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" required={fileRequired} onChange={fileChanged} disabled={disabled} />
        {form.file && <p className="mt-1 text-xs text-muted-foreground">Nouveau fichier : {form.file.name}</p>}
        {error("file")}
      </div>
    </div>
  );
}
