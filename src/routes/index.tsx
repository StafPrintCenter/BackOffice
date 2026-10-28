import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
