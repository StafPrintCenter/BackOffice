import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { DataTable } from "@/components/site/DataTable";
import { useAdminTrainingsList } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import type { APIAdminTrainingListItem } from "@/data/trainings";
import { GraduationCap, UserRoundPlus } from "lucide-react";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/manage/")({
  head: () => ({
    meta: [
      { title: `Contenu des formations | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTrainingsManage,
});

function AdminTrainingsManage() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: themes } = useAdminCategoriesList({ perPage: 100, context: "formation" });

  return (
    <>
      <PageHeader title="Contenu des formations" description="Gérez les modules et leçons de chaque formation." />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <Link to="/trainings/catalogs"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <GraduationCap className="h-4 w-4"
            />
            Voir le catalogue des formations
          </Link>
        </div>
        <div>
          <Link to="/trainings/registrations"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <UserRoundPlus className="h-4 w-4" />
            Voir les inscriptions
          </Link>
        </div>
      </div>

      <DataTable<APIAdminTrainingListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "theme"]}
        onView={(r) => navigate({ to: "/trainings/manage/$id", params: { id: r.id } })}
        columns={[
          { key: "title", label: "Formation", render: (r) => <div className="font-medium">{r.title}</div> },
          {
            key: "theme",
            label: "Thème",
            render: (r) => {
              const match = themes.find((t) => t.id === r.themeId);
              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {r.theme}
                </span>
              );
            },
          },
          {
            key: "level",
            label: "Niveau",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getTrainingLevelBadgeClass(r.level)}`}>
                {r.level}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut de la formation",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getTrainingStatusBadgeClass(r.status)}`}>
                {getTrainingStatusLabel(r.status)}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}