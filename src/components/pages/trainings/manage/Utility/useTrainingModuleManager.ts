import { useState } from "react";
import { toast } from "sonner";
import type { AdminTrainingModulePayload, APIAdminTrainingModule } from "@/data/trainingModules";
import {
  useCreateAdminTrainingModule,
  useDeleteAdminTrainingModule,
  usePublishAdminTrainingModule,
  useUpdateAdminTrainingModule,
} from "@/stores/useTrainingModulesStore";
import type { ModuleDialogState } from "../Training/ManageDialogs";

const EMPTY_MODULE_FORM: AdminTrainingModulePayload = {
  title: "",
  description: "",
  sort_order: 0,
  is_enabled: true,
};

export function useTrainingModuleManager(trainingId: string, moduleCount: number) {
  const createMutation = useCreateAdminTrainingModule();
  const updateMutation = useUpdateAdminTrainingModule();
  const deleteMutation = useDeleteAdminTrainingModule();
  const publishMutation = usePublishAdminTrainingModule();

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<ModuleDialogState>({ open: false });
  const [form, setForm] = useState<AdminTrainingModulePayload>(EMPTY_MODULE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [moduleToDelete, setModuleToDelete] = useState<APIAdminTrainingModule | null>(null);

  const toggle = (moduleId: string) => {
    setExpandedIds((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId]
    );
  };

  const openCreate = () => {
    setForm({ ...EMPTY_MODULE_FORM, sort_order: moduleCount });
    setErrors({});
    setDialog({ open: true });
  };

  const openEdit = (module: APIAdminTrainingModule) => {
    setForm({
      title: module.title,
      description: module.description ?? "",
      sort_order: module.sortOrder,
      is_enabled: module.isEnabled,
    });
    setErrors({});
    setDialog({ open: true, row: module });
  };

  const submit = () => {
    if (!form.title.trim()) {
      setErrors({ title: "Le titre est requis" });
      return;
    }

    setErrors({});
    if (dialog.row) {
      updateMutation.mutate(
        { moduleId: dialog.row.id, payload: form },
        {
          onSuccess: () => { toast.success("Module modifié"); setDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la modification du module"),
        }
      );
    } else {
      createMutation.mutate(
        { trainingId, payload: form },
        {
          onSuccess: () => { toast.success("Module créé"); setDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la création du module"),
        }
      );
    }
  };

  const publish = (module: APIAdminTrainingModule) => {
    publishMutation.mutate(module.id, {
      onSuccess: () => toast.success("Module publié"),
      onError: () => toast.error("Erreur lors de la publication du module"),
    });
  };

  const confirmDelete = () => {
    if (!moduleToDelete) return;
    deleteMutation.mutate(
      { trainingId, moduleId: moduleToDelete.id },
      {
        onSuccess: () => {
          toast.success("Module supprimé");
          setExpandedIds((current) => current.filter((id) => id !== moduleToDelete.id));
          setModuleToDelete(null);
        },
        onError: () => toast.error("Erreur lors de la suppression du module"),
      }
    );
  };

  return {
    expandedIds,
    toggle,
    dialog,
    setDialog,
    form,
    setForm,
    errors,
    moduleToDelete,
    setModuleToDelete,
    openCreate,
    openEdit,
    submit,
    publish,
    confirmDelete,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isPublishing: publishMutation.isPending,
  };
}
