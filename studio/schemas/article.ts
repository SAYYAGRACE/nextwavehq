import { defineType, defineField } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article / Update",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      description: "URL slug — auto-generated from the title.",
      options: { source: "title", maxLength: 120 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "category", type: "string", title: "Category", placeholder: "e.g. Bootcamp, NerdHaven, Partnership" }),
    defineField({ name: "excerpt", type: "text", title: "Excerpt", rows: 3, description: "Short summary shown on cards." }),
    defineField({ name: "coverImage", type: "image", title: "Cover image", options: { hotspot: true } }),
    defineField({ name: "publishedAt", type: "datetime", title: "Published at" }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: [{ type: "block" }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category" },
  },
});