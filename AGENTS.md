<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## News article conventions

For every article on the News & Updates page, add a metadata bullet list immediately
after the title (first item of the article body, `Item[]`), unless it already exists:

```ts
{
  k: "ul",
  items: [
    "**Publication:** Nextwave Media Desk",
    "**Series:** <topic-appropriate series name>",
    "**Date:** <Month Year>",
  ],
},
```

- **Publication** is always `Nextwave Media Desk`.
- **Series** is chosen to match the article's topic (e.g. "Education Reform & Practical Skills", "School Tech Readiness & Measurement", "Policy, Governance & the Digital Economy", "Perspectives in Educational Innovation & Community Growth").
- **Date** is the article's publication month and year (currently `October 2026`).
- After editing any article, regenerate PDFs with `bun run gen:news-pdf` and commit the PDFs.
