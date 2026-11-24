import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAdminTrainingDetail } from "@/stores/useTrainingsStore";
import { useTrainingModulesList } from "@/stores/useTrainingModulesStore";
import { TrainingManagePage, useTrainingLessonManager, useTrainingModuleManager, useTrainingReviewManager } from "@/components/pages/trainings/manage";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/catalogs/$id/manage")({
  head: () => ({
    meta: [
      { title: `Contenu de la formation | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainingManageDetail,
});

function TrainingManageDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: training, isLoading: trainingLoading } = useAdminTrainingDetail(id);
  const { modules, isLoading: modulesLoading } = useTrainingModulesList(id);

  const moduleManager = useTrainingModuleManager(id, modules.length);
  const lessonManager = useTrainingLessonManager();
  const reviewManager = useTrainingReviewManager();

  return (
    <TrainingManagePage
      training={training}
      trainingLoading={trainingLoading}
      modules={modules}
      modulesLoading={modulesLoading}
      moduleManager={moduleManager}
      lessonManager={lessonManager}
      reviewManager={reviewManager}
      onBack={() => navigate({ to: "/trainings/catalogs" })}
      onViewContent={(trainingId) => navigate({ to: "/trainings/catalogs/$id", params: { id: trainingId } })}
    />
  );
}
