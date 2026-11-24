import { Crown, GraduationCap } from "lucide-react";
import { getContentCreator } from "@/data/trainingModules";

export function ContentCreatorBadge({
  createdByAdmin,
  createdByInstructor,
}: {
  createdByAdmin?: string | null;
  createdByInstructor?: string | null;
}) {
  const creator = getContentCreator(createdByAdmin, createdByInstructor);
  if (!creator) return null;

  const Icon = creator.role === "admin" ? Crown : GraduationCap;
  const className = creator.role === "admin"
    ? "bg-violet-500/10 text-violet-600"
    : "bg-sky-500/10 text-sky-600";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${className}`}>
      <Icon className="h-3 w-3" />
      {creator.label}
      <span className="opacity-70">({creator.role === "admin" ? "Admin" : "Instructeur"})</span>
    </span>
  );
}

export function formatContentDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}
