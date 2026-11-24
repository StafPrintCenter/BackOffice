import { Calendar, CheckCircle2, ChevronDown, CircleChevronUp, ListChecks, Plus, Rocket, ShieldCheck, ShieldOff, Trash2, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getContentStatusBadgeClass, getContentStatusLabel } from "@/data/trainingModules";
import type { APIAdminLesson, APIAdminTrainingModule } from "@/data/trainingModules";
import { ContentCreatorBadge, formatContentDate } from "../ContentCreatorBadge";
import { ModuleLessonsList } from "../ModuleLessonsList";

type ReviewAction = (
  type: "module" | "lesson" | "quiz",
  id: string,
  title: string,
  decision: "approved" | "rejected",
) => void;

interface TrainingModuleListProps {
  modules: APIAdminTrainingModule[];
  expandedModuleIds: string[];
  expandedLessonIds: string[];
  toggleModule: (id: string) => void;
  toggleLesson: (id: string) => void;
  openEditModule: (module: APIAdminTrainingModule) => void;
  handlePublishModule: (module: APIAdminTrainingModule) => void;
  publishModulePending: boolean;
  setModuleToDelete: (module: APIAdminTrainingModule) => void;
  openCreateLesson: (moduleId: string) => void;
  openEditLesson: (moduleId: string, lesson: APIAdminLesson) => void;
  handlePublishLesson: (lesson: APIAdminLesson) => void;
  setLessonToDelete: (data: { moduleId: string; lesson: APIAdminLesson }) => void;
  openReview: ReviewAction;
  publishLessonPending: boolean;
}

export function TrainingModuleList({
  modules,
  expandedModuleIds,
  expandedLessonIds,
  toggleModule,
  toggleLesson,
  openEditModule,
  handlePublishModule,
  publishModulePending,
  setModuleToDelete,
  openCreateLesson,
  openEditLesson,
  handlePublishLesson,
  setLessonToDelete,
  openReview,
  publishLessonPending,
}: TrainingModuleListProps) {
  return (
    <div className="space-y-3">
      {[...modules].sort((a, b) => a.sortOrder - b.sortOrder).map((module) => {
        const isExpanded = expandedModuleIds.includes(module.id);
        return (
          <div key={module.id} className="overflow-hidden rounded-2xl border bg-card">
            <button
              type="button"
              onClick={() => toggleModule(module.id)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{module.title}</span>
                  <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(module.status)}`}>
                    {getContentStatusLabel(module.status)}
                  </span>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${module.isEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                    {module.isEnabled ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldOff className="h-2.5 w-2.5" />}
                    {module.isEnabled ? "Activé" : "Désactivé"}
                  </span>
                </div>
                {module.description && <div className="mt-0.5 truncate text-xs text-muted-foreground">{module.description}</div>}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/70">
                  <span>{module.lessonsCount} leçon{module.lessonsCount !== 1 ? "s" : ""} · Ordre {module.sortOrder}</span>
                  <ContentCreatorBadge createdByAdmin={module.createdByAdmin} createdByInstructor={module.createdByInstructor} />
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatContentDate(module.createdAt)}
                  </span>
                </div>
              </div>
              {isExpanded
                ? <CircleChevronUp className="h-4 w-4 shrink-0 text-primary" />
                : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>

            <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => openEditModule(module)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Modifier
              </Button>
              {module.status === "pending_review" && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-500/10"
                    onClick={() => openReview("module", module.id, module.title, "approved")}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approuver
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => openReview("module", module.id, module.title, "rejected")}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" /> Rejeter
                  </Button>
                </>
              )}
              {module.status !== "published" && module.status !== "pending_review" && (
                <Button type="button" variant="ghost" size="sm" onClick={() => handlePublishModule(module)} disabled={publishModulePending}>
                  <Rocket className="mr-1 h-3.5 w-3.5" /> Publier
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setModuleToDelete(module)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-3 border-t bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ListChecks className="h-4 w-4 text-primary" /> Leçons
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => openCreateLesson(module.id)}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une leçon
                  </Button>
                </div>
                <ModuleLessonsList
                  moduleId={module.id}
                  expandedLessonIds={expandedLessonIds}
                  toggleLesson={toggleLesson}
                  openEditLesson={openEditLesson}
                  handlePublishLesson={handlePublishLesson}
                  setLessonToDelete={setLessonToDelete}
                  openReview={openReview}
                  publishLessonPending={publishLessonPending}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
