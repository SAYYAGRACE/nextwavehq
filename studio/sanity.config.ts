import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { article } from "./schemas/article";

export default defineConfig({
  name: "nextwave",
  title: "Nextwave Studio",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "nffdmmjo",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool()],
  schema: {
    types: [article],
  },
});