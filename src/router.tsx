import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 10_000,
    // Preload routes on hover/focus intent so navigation feels instant on click.
    defaultPreload: "intent",
    defaultPreloadDelay: 60,
  });

  return router;
};
