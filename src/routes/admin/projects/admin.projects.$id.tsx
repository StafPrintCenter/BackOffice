import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { projectsApi } from "@/api/projects.api";

export const Route = createFileRoute("/admin/projects/admin/projects/$id")({
  head: () => ({ meta: [{ title: "Projet — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const p = data?.find((x) => x.id === id);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/projects" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!p ? <p className="text-muted-foreground">Projet introuvable.</p> : (
        <div className="max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl border"><img src={p.imageUrl} alt={p.title} className="aspect-video w-full object-cover" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5">{p.category}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{p.year}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{p.title}</h1>
            <div className="mt-1 text-muted-foreground">Client : <b className="text-foreground">{p.client}</b></div>
          </div>
          <div className="rounded-2xl border bg-card p-6"><div className="font-semibold mb-2">Description</div><p className="text-sm leading-relaxed">{p.description}</p></div>
        </div>
      )}
    </AdminShell>
  );
}
