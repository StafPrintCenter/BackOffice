import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { useAdminTrainingDetail, useUpdateAdminTraining, useDeleteAdminTraining } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { sanitizeTrainingPayload } from "@/data/trainings";
import type { AdminTrainingPayload } from "@/data/trainings";
import { SITE } from "@/data/site";
import { toPayload } from "@/components/trainings/detail/training-form";
import { TrainingDetailHero, TrainingDetailInstructorsSection, TrainingDetailEditForm, TrainingDetailSidebar } from "@/components/trainings/detail";
import { TrainingObjectivesCard, TrainingProgramCard } from "@/components/trainings/detail/TrainingContentCards";
import { TrainingSidebar } from "@/components/trainings/detail/TrainingSidebar";
import { TrainingSessionsCard } from "@/components/trainings/detail/TrainingSessionsCard";
import { TrainingStudentsSection } from "@/components/trainings/enrollments/TrainingStudentsSection";

export const Route = createFileRoute("/_admin/trainings/catalogs/$id/")({
  head: () => ({ meta: [{ title: `Formations | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: TrainingDetail,
});

function TrainingDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: training, isLoading } = useAdminTrainingDetail(id);
  const { items: themes } = useAdminCategoriesList({ perPage: 100, context: "formation" });
  const updateMutation = useUpdateAdminTraining();
  const removeMutation = useDeleteAdminTraining();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminTrainingPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (training && !form) setForm(toPayload(training));
  }, [training, form]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...</div>;
  }

  if (!training || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Button>
        </div>
        <p className="text-muted-foreground">Formation introuvable.</p>
      </>
    );
  }

  const themeMeta = themes.find((t) => t.id === training.themeId);
  const themeColorClass = themeMeta?.colorClass ?? "bg-slate-100 text-slate-700";
  const mainColor = training.coverColor || "var(--primary)";

  const handleSave = () =>
    updateMutation.mutate({ id: training.id, payload: sanitizeTrainingPayload(form) }, {
      onSuccess: () => { toast.success("Formation modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });

  const handleCancel = () => { setForm(toPayload(training)); setIsEditing(false); };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/catalogs" })}><ArrowLeft className="mr-1 h-4 w-4" /> Retour</Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}><X className="mr-1 h-4 w-4" /> Annuler</Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}><Save className="mr-1 h-4 w-4" /> Enregistrer</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="mr-1 h-4 w-4" /> Modifier</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}><Trash2 className="mr-1 h-4 w-4" /> Supprimer</Button>
              <Button size="sm" onClick={() => navigate({ to: "/trainings/catalogs/$id/manage", params: { id: training.id } })}><BookOpen className="mr-1 h-4 w-4" /> Gérer le contenu</Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <TrainingEditForm form={form} setForm={setForm} themes={themes} />
      ) : (
        <div className="space-y-6">
          <TrainingDetailHero training={training} themeColorClass={themeColorClass} mainColor={mainColor} />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <TrainingObjectivesCard training={training} mainColor={mainColor} />
              <TrainingProgramCard training={training} mainColor={mainColor} />
              <TrainingDetailInstructorsSection trainingId={id} mainColor={mainColor} />
              <TrainingSessionsCard trainingId={training.id} color={mainColor} />
              <TrainingStudentsSection trainingId={training.id} color={mainColor} />
            </div>
            <TrainingSidebar training={training} mainColor={mainColor} />
          </div>
        </div>
      )}

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() =>
          removeMutation.mutate(training.id, {
            onSuccess: () => { toast.success("Formation supprimée"); navigate({ to: "/trainings/catalogs" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          })
        }
        title={`Supprimer "${training.title}" ?`}
      />
    </>
  );
}