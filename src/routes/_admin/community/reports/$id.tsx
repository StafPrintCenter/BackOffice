import { createFileRoute } from "@tanstack/react-router";
import { ReportDetailPage } from "@/components/pages/community/reports";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/community/reports/$id")({
  head: () => ({
    meta: [
      { title: `Détail du signalement | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportDetailRoute,
});

function ReportDetailRoute() {
  const { id } = Route.useParams();

  return <ReportDetailPage reportId={id} />;
}
