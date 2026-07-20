import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { Button } from "@/components/ui/button";
import { articlesApi } from "@/api/articles.api";

export const Route = createFileRoute("/admin/articles/$slug")({
  head: () => ({ meta: [{ title: "Article — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });
  const a = data?.find((x) => x.slug === slug);
  return (
    <AdminShell>
      <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/articles" })}><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Button></div>
      {!a ? <p className="text-muted-foreground">Article introuvable.</p> : (
        <article className="max-w-3xl space-y-6">
          <div className="overflow-hidden rounded-2xl border"><img src={a.coverImage} alt={a.title} className="aspect-video w-full object-cover" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-muted px-2 py-0.5">{a.category}</span>
              <span className="text-muted-foreground">par {a.author}</span>
              <span className="text-muted-foreground">· {new Date(a.publishedAt).toLocaleDateString()}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">{a.title}</h1>
            <p className="mt-2 text-muted-foreground italic">{a.excerpt}</p>
          </div>
          <div className="prose prose-sm max-w-none rounded-2xl border bg-card p-6" dangerouslySetInnerHTML={{ __html: a.htmlContent }} />
        </article>
      )}
    </AdminShell>
  );
}
