import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star as StarIcon } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { servicesApi } from "@/api/services.api";

export const Route = createFileRoute("/admin/services/$slug")({
  head: () => ({ meta: [{ title: "Service — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
  const s = data?.find((x) => x.slug === slug);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/services" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!s ? <p className="text-muted-foreground">Service introuvable.</p> : (
        <div className="max-w-4xl space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5">{s.category}</span>
              {s.featured && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary"><StarIcon className="h-3 w-3" /> En vedette</span>}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{s.title}</h1>
            <p className="mt-2 text-muted-foreground">{s.shortDescription}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6"><div className="font-semibold mb-2">Description</div><p className="text-sm leading-relaxed">{s.longDescription}</p></div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Slug</div><code>{s.slug}</code></div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Icône</div>{s.icon}</div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Couleur</div><div className="mt-1 flex items-center gap-2"><span className="h-4 w-4 rounded" style={{ background: s.color }} />{s.color}</div></div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
