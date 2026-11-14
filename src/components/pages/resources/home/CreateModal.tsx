import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ResourceFormFields, EMPTY_RESOURCE_FORM, type ResourceFormValues } from "./FormFields";
import { adminResourcePayloadSchema } from "@/data/resources";
import type { AdminResourcePayload } from "@/data/resources";
import { useCreateAdminResource } from "@/stores/useResourcesStore";

interface ResourceCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toPayload(form: ResourceFormValues): AdminResourcePayload {
  return {
    slug: form.slug.trim() || undefined,
    title: form.title,
    category: form.category,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
    status: form.status.trim() || undefined,
    short: form.short,
    description: form.description,
    format: form.format,
    meta: form.meta,
    includes: form.includes.map((item) => item.trim()).filter(Boolean),
    outcomes: form.outcomes.map((item) => item.trim()).filter(Boolean),
    audience: form.audience,
    requirements: form.requirements.map((item) => item.trim()).filter(Boolean),
    license: form.license,
    file: form.file ?? undefined,
  };
}

export function ResourceCreateModal({ open, onOpenChange }: ResourceCreateModalProps) {
  const createMutation = useCreateAdminResource();
  const [form, setForm] = useState<ResourceFormValues>(EMPTY_RESOURCE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setForm(EMPTY_RESOURCE_FORM);
      setErrors({});
    }
    onOpenChange(isOpen);
  };

  const submit = () => {
    const payload = toPayload(form);
    const parsed = adminResourcePayloadSchema.safeParse(payload);
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
    }
    if (!form.file) {
      nextErrors.file = "Le fichier est requis.";
    }
    if (!parsed.success || Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    createMutation.mutate(parsed.data, {
      onSuccess: () => {
        toast.success("Ressource créée");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors de la création"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvelle ressource</DialogTitle></DialogHeader>
        <ResourceFormFields form={form} onChange={setForm} errors={errors} fileRequired />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
