import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { testimonialsApi } from "@/api/testimonials.api";

export const Route = createFileRoute("/admin/testimonials/$id")({
  head: () => ({ meta: [{ title: "Témoignage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: TestimonialDetail,
});

function TestimonialDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["testimonials"], queryFn: testimonialsApi.list });
  const t = data?.find((x) => x.id === id);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/testimonials" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!t ? <p className="text-muted-foreground">Témoignage introuvable.</p> : (
        <div className="max-w-2xl">
          <div className="rounded-2xl border bg-card p-8">
            <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}</div>
            <blockquote className="mt-4 text-xl italic font-display leading-relaxed">"{t.quote}"</blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">{t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div><div className="font-semibold">{t.name}</div><div className="text-xs text-muted-foreground">{t.role} · {t.company}</div></div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
