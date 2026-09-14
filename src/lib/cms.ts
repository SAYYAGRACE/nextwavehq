import { createClient } from "@sanity/client";

export type NewsArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  image?: string | null;
  body?: unknown;
};

type ArticleDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  image?: string | null;
  body?: unknown;
};

const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID as string | undefined;
const DATASET = (import.meta.env.VITE_SANITY_DATASET as string | undefined) ?? "production";

const GROQ_LIST = `*[_type == "article" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  _id, title, "slug": slug.current, excerpt, category, publishedAt, body,
  "image": coverImage.asset->url
}`;

const GROQ_SLUG = `*[slug.current == $slug][0] {
  _id, title, "slug": slug.current, excerpt, category, publishedAt, body,
  "image": coverImage.asset->url
}`;

function getClient() {
  if (!PROJECT_ID) return null;
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: "2024-01-01",
    useCdn: true,
  });
}

function toArticle(d: ArticleDoc): NewsArticle {
  return {
    _id: d._id,
    title: d.title,
    slug: d.slug?.current ?? "",
    excerpt: d.excerpt,
    category: d.category,
    publishedAt: d.publishedAt,
    image: d.image ?? null,
    body: d.body,
  };
}

export async function fetchArticles(): Promise<NewsArticle[]> {
  const client = getClient();
  if (!client) return [];
  try {
    const docs = (await client.fetch<ArticleDoc[]>(GROQ_LIST)) ?? [];
    return docs.filter((d) => d.title && d.slug).map(toArticle);
  } catch {
    return [];
  }
}

export async function fetchArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const client = getClient();
  if (!client || !slug) return null;
  try {
    const doc = await client.fetch<ArticleDoc | null>(GROQ_SLUG, { slug });
    if (!doc?.title) return null;
    return toArticle(doc);
  } catch {
    return null;
  }
}
