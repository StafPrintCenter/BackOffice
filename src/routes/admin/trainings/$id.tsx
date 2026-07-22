import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { formationsApi } from "@/api/formations.api";

export const Route = createFileRoute("/admin/trainings/$id")({
  head: () => ({ meta: [{ title: "Formation — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FormationDetail,
});

function FormationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["formations"], queryFn: formationsApi.list });
  const f = data?.find((x) => x.id === id);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/trainings" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!f ? <p className="text-muted-foreground">Formation introuvable.</p> : (
        <div className="max-w-4xl space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5">{f.theme}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{f.level}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{f.duration}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{f.title}</h1>
            <div className="mt-2 font-display text-2xl text-primary">{f.price.toLocaleString()} FCFA</div>
          </div>
          <div className="rounded-2xl border bg-card p-6"><div className="font-semibold mb-3">Objectifs</div><ul className="list-disc list-inside space-y-1 text-sm">{f.objectives.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-semibold mb-3">Programme</div>
            <div className="space-y-4">
              {f.program.map((m, i) => (
                <div key={i}>
                  <div className="text-sm font-medium">{i + 1}. {m.title}</div>
                  <ul className="mt-1 ml-5 list-disc text-xs text-muted-foreground space-y-0.5">{m.lessons.map((l, j) => <li key={j}>{l}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
