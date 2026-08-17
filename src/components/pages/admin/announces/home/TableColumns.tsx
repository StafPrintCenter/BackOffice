import type { Column } from "@/components/site/DataTable";
import type { APIAdminAnnouncement } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, getAnnouncementStyleBadge } from "@/data/announcements";
import { AnnouncementStatusBadge } from "../shared/AnnouncementStatusBadge";

export const announcementTableColumns: Column<APIAdminAnnouncement>[] = [
  {
    key: "title",
    label: "Titre",
    render: (r) => (
      <div>
        <div className="font-medium">{r.title}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">{r.message}</div>
      </div>
    ),
  },
  {
    key: "type",
    label: "Type",
    render: (r) => (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
        {ANNOUNCEMENT_TYPE_LABELS[r.type]}
      </span>
    ),
  },
  {
    key: "position",
    label: "Position",
    render: (r) => <span className="text-xs">{ANNOUNCEMENT_POSITION_LABELS[r.position]}</span>,
  },
  {
    key: "style",
    label: "Style",
    render: (r) => (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getAnnouncementStyleBadge(r.style)}`}>
        {r.style ? ANNOUNCEMENT_STYLE_LABELS[r.style] : "-"}
      </span>
    ),
  },
  {
    key: "priority",
    label: "Priorité",
    render: (r) => <span className="text-xs font-mono">{r.priority}</span>,
  },
  {
    key: "status",
    label: "Statut",
    render: (r) => <AnnouncementStatusBadge announcement={r} />,
  },
];