import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { AdminShell } from "@/components/site/AdminShell";
import { Button } from "@/components/ui/button";
import { statsApi } from "@/api/extra.api";

export const Route = createFileRoute("/admin/stats/admin/stats/$id")({
  head: () => ({ meta: [{ title: "Statistique — Admin" }, { name: "robots", content: "noindex" }] }),
  component: StatDetail,
});

function StatDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["stats"], queryFn: statsApi.list });
  const s = data?.find((x) => x.id === id);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/stats" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!s ? <p className="text-muted-foreground">Statistique introuvable.</p> : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-8 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-primary" />
            <div className="mt-4 font-display text-6xl font-bold text-primary">{s.value}{s.suffix}</div>
            <div className="mt-2 text-lg font-medium">{s.label}</div>
            <code className="mt-3 inline-block text-xs text-muted-foreground">{s.key}</code>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Clé</div><code>{s.key}</code></div>
            <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground">Créé le</div>{new Date(s.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
