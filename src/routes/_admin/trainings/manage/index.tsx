import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { DataTable } from "@/components/site/DataTable";
import { useAdminTrainingsList } from "@/stores/useTrainingsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import type { APIAdminTrainingListItem } from "@/data/trainings";
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

  const createMutation = useCreateAdminTraining();
  const updateMutation = useUpdateAdminTraining();
  const removeMutation = useDeleteAdminTraining();

  const [dialog, setDialog] = useState<{ open: boolean; row?: APIAdminTrainingListItem }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminTrainingListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };

  const submit = () => {
    const cleaned: FormValues = {
      ...form,
      objectives: form.objectives.filter((o) => o.trim()),
      prerequisites: form.prerequisites.filter((p) => p.trim()),
      program: form.program
        .filter((m) => m.title.trim())
        .map((m) => ({ ...m, items: m.items.filter((i) => i.trim()) })),
    };
    const parsed = schema.safeParse(cleaned);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload = sanitizeTrainingPayload(parsed.data as AdminTrainingPayload);

    if (dialog.row) {
      updateMutation.mutate({ id: dialog.row.id, payload }, {
        onSuccess: () => { toast.success("Formation modifiée"); setDialog({ open: false }); },
        onError: () => toast.error("Erreur lors de la modification"),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success("Formation créée"); setDialog({ open: false }); },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <>
      <PageHeader title="Formations" description="Programmes proposés au public." />

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/trainings/registrations"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" />
          Voir les inscriptions
        </Link>
      </div>

      <DataTable<APIAdminTrainingListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "theme"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/trainings/catalogs/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "title", label: "Titre", render: (r) => <div className="font-medium">{r.title}</div> },
          {
            key: "theme",
            label: "Thème",
            render: (r) => {
              const match = themes.find(
                (t) => t.id === r.themeId || t.name.toLowerCase() === (typeof r.theme === "string" ? r.theme.toLowerCase() : "")
              );

              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              const themeName = typeof r.theme === "string" ? r.theme : match?.name || "Sans thème";

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {themeName}
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