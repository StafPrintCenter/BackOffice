import type { APIAdminAnnouncement } from "@/data/announcements";

function statusBadge(a: APIAdminAnnouncement) {
  if (!a.isEnabled) return "bg-muted text-muted-foreground";
  return a.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600";
}

function statusLabel(a: APIAdminAnnouncement) {
  if (!a.isEnabled) return "Désactivée";
  return a.isActive ? "Active" : "En attente";
}

export function AnnouncementStatusBadge({ announcement }: { announcement: APIAdminAnnouncement }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(announcement)}`}>
      {statusLabel(announcement)}
    </span>
  );
}