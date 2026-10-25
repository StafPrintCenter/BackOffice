import { PreferenceCard } from "@/components/pages/notifications/shared";
import type { APINotificationPreference } from "@/data/notifications";

interface PreferencesGridProps {
  preferences: APINotificationPreference[];
}

export function PreferencesGrid({ preferences }: PreferencesGridProps) {
  return (
    <div className="grid max-w-4xl gap-4 grid-cols-1 md:grid-cols-2">
      {preferences.map((p) => (
        <PreferenceCard key={p.category} preference={p} />
      ))}
    </div>
  );
}