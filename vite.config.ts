import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Force-enable Nitro so the Lovable plugin applies the server build
  nitro: true,
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  // Leave Vite defaults — Nitro will be handled by the Lovable config
  vite: {},
});