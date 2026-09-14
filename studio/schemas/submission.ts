import { defineType, defineField } from "sanity";

export const submission = defineType({
  name: "submission",
  title: "Form Submission",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      title: "Kind",
      options: {
        list: [
          { title: "Contact", value: "contact" },
          { title: "Newsletter", value: "newsletter" },
          { title: "Waitlist", value: "waitlist" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "email", type: "string", title: "Email", validation: (r) => r.required() }),
    defineField({ name: "name", type: "string", title: "Name" }),
    defineField({ name: "organization", type: "string", title: "Organization" }),
    defineField({ name: "intent", type: "string", title: "Intent" }),
    defineField({ name: "message", type: "text", title: "Message", rows: 6 }),
    defineField({ name: "source", type: "string", title: "Source" }),
    defineField({ name: "createdAt", type: "datetime", title: "Submitted at" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdAtDesc",
      by: [{ field: "createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "email", subtitle: "kind", media: "createdAt" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Submission",
        subtitle: subtitle ? `${subtitle} submission` : undefined,
      };
    },
  },
});
