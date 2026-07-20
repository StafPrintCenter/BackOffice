import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { faqsApi, categoriesApi } from "@/api/extra.api";

export const Route = createFileRoute("/admin/faqs/$id")({
  head: () => ({ meta: [{ title: "FAQ — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FaqDetail,
});

function FaqDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["faqs"], queryFn: faqsApi.list });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const f = data?.find((x) => x.id === id);
  const cat = cats?.find((c) => c.id === f?.categoryId);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/faqs" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!f ? <p className="text-muted-foreground">FAQ introuvable.</p> : (
        <div className="max-w-3xl space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {cat && <span className="rounded-full bg-muted px-2 py-0.5">{cat.name}</span>}
              <span className="rounded-full bg-muted px-2 py-0.5">Ordre {f.order}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold">{f.question}</h1>
          </div>
          <div className="rounded-2xl border bg-card p-6"><div className="font-semibold mb-2">Réponse</div><p className="text-sm leading-relaxed whitespace-pre-wrap">{f.answer}</p></div>
        </div>
      )}
    </AdminShell>
  );
}
