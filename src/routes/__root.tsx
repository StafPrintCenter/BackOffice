import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { SITE } from "@/data/site";
import { NotFoundComponent, ErrorComponent } from "@/components/errors";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const PAGE_TITLE = `${SITE.tool} - Gérez et administrez votre plateforme | ${SITE.name}`;
    const PAGE_DESC = `Administrez la plateforme ${SITE.name}, gérez les utilisateurs, les formations et les activités, et suivez les indicateurs clés depuis votre espace d'administration.`;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
        { title: PAGE_TITLE },
        { name: "description", content: PAGE_DESC },
        { name: "author", content: SITE.manager },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE.name },
        { property: "og:title", content: PAGE_TITLE },
        { property: "og:description", content: PAGE_DESC },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@StafPrintCenter" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
