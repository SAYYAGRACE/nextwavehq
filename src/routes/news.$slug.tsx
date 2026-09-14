import { createFileRoute, Link } from "@tanstack/react-router";
import { PortableText } from "@portabletext/react";
import { CalendarDays, ArrowLeft, Newspaper } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchArticleBySlug, type NewsArticle } from "@/lib/cms";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }): Promise<{ article: NewsArticle | null }> => ({
    article: await fetchArticleBySlug(params.slug),
  }),
  component: NewsDetailPage,
});

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function NewsDetailPage() {
  const { article } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 lg:pt-44">
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All updates
          </Link>

          {!article ? (
            <div className="mt-10 rounded-3xl glass-strong p-12 text-center">
              <Newspaper className="mx-auto h-9 w-9 text-brand-glow" strokeWidth={1.5} />
              <h1 className="mt-5 text-2xl font-bold text-white">Update not found.</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This story may have been unpublished or moved.
              </p>
            </div>
          ) : (
            <article className="mt-8">
              <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-muted-foreground">
                {article.category && <span className="text-brand-glow">{article.category}</span>}
                {article.publishedAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {article.excerpt}
                </p>
              )}
              {article.image && (
                <div className="mt-8 overflow-hidden rounded-2xl border border-hairline">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-cover"
                  />
                </div>
              )}
              {article.body && (
                <div className="mt-8 prose-invert max-w-none">
                  <PortableText
                    value={article.body as Parameters<typeof PortableText>[0]["value"]}
                  />
                </div>
              )}
            </article>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
