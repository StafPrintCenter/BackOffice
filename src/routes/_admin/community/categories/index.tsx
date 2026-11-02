import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { CategoriesManager } from "@/components/pages/community/categories";

export const Route = createFileRoute("/_admin/community/categories/")({
  head: () => ({ meta: [{ title: `Catégories communauté | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: CategoryPage,
});

function CategoryPage() {
  return <CategoriesManager />;
}