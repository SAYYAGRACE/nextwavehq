import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ArrowRight, Newspaper } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Aurora } from "@/components/Aurora";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { fetchArticles, type NewsArticle } from "@/lib/cms";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/news/")({
  loader: async (): Promise<{ articles: NewsArticle[] }> => ({
    articles: await fetchArticles(),
  }),
  head: () => ({
    meta: [
      { title: "News & Updates — Nextwave" },
      {
        name: "description",
        content:
          "Latest news, updates and press from Nextwave Infotech — the bootcamp, NerdHaven, and the deep-tech movement across Northern Nigeria.",
      },
      { property: "og:title", content: "News & Updates — Nextwave" },
      {
        property: "og:description",
        content: "Updates from the movement: bootcamp, NerdHaven, and partnerships.",
      },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsIndexPage,
});

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function NewsIndexPage() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 lg:pt-44 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>News & Updates</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
              The movement, <span className="gradient-text">in motion.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Bootcamp milestones, NerdHaven progress, partnership announcements, and stories from
              the field in Kawo, Kaduna.
            </p>
          </Reveal>

          {articles.length === 0 ? (
            <Reveal delay={100}>
              <div className="mt-16 rounded-3xl glass-strong p-12 sm:p-16 text-center">
                <Newspaper className="mx-auto h-10 w-10 text-brand-glow" strokeWidth={1.5} />
                <h2 className="mt-6 text-2xl font-bold text-white">News is landing soon.</h2>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground leading-relaxed">
                  Stories from the classroom, cohort milestones and partnership announcements are
                  being prepared. Check back shortly — or get them as they land.
                </p>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
                  style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                >
                  Contact the team
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <Reveal key={a._id} delay={(i % 3) * 80}>
                  <Link to="/news/$slug" params={{ slug: a.slug }} className="group block h-full">
                    <SpotlightCard className="h-full overflow-hidden rounded-2xl border border-hairline">
                      {a.image && (
                        <div className="aspect-[16/9] w-full overflow-hidden bg-white/[0.03]">
                          <img
                            src={a.image}
                            alt={a.title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-muted-foreground">
                          {a.category && <span className="text-brand-glow">{a.category}</span>}
                          {a.publishedAt && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(a.publishedAt)}
                            </span>
                          )}
                        </div>
                        <h2 className="mt-3 text-lg font-semibold text-white leading-snug group-hover:text-brand-glow transition-colors">
                          {a.title}
                        </h2>
                        {a.excerpt && (
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {a.excerpt}
                          </p>
                        )}
                        <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-brand-glow">
                          Read more
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </SpotlightCard>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
