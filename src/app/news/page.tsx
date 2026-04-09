import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Header } from "@/components/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

interface NewsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: "latest" | "popular" | "relevance";
    date?: string;
    format?: "all" | "article" | "video";
  }>;
}

interface NewsQueryRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[] | null;
  featured_image: string | null;
  published_at: string | null;
  views: number | null;
  read_time: number | null;
  video_url: string | null;
  categories: Array<{ name: string }> | null;
}

function daysSince(dateInput: string | null): number {
  if (!dateInput) return 365;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return 365;
  return Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function ngramSet(value: string): Set<string> {
  const normalized = value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) return new Set();
  const grams = new Set<string>();
  const padded = ` ${normalized} `;
  for (let index = 0; index < padded.length - 2; index += 1) {
    grams.add(padded.slice(index, index + 3));
  }
  return grams;
}

function trigramSimilarity(a: string, b: string): number {
  const aSet = ngramSet(a);
  const bSet = ngramSet(b);
  if (!aSet.size || !bSet.size) return 0;
  let overlap = 0;
  for (const gram of aSet) {
    if (bSet.has(gram)) overlap += 1;
  }
  return overlap / Math.max(aSet.size, bSet.size);
}

function computeRelevance(
  query: string,
  row: Pick<NewsQueryRow, "title" | "summary" | "tags" | "published_at" | "views">,
): number {
  const q = query.toLowerCase().trim();
  const title = row.title.toLowerCase();
  const summary = (row.summary ?? "").toLowerCase();
  const tags = (row.tags ?? []).join(" ").toLowerCase();

  const titleExactBoost = title.includes(q) ? 55 : 0;
  const summaryBoost = summary.includes(q) ? 16 : 0;
  const tagBoost = tags.includes(q) ? 14 : 0;
  const typoToleranceBoost = Math.round(trigramSimilarity(q, title) * 28);
  const freshnessBoost = Math.round(Math.max(0, 1 - daysSince(row.published_at) / 30) * 18);
  const popularityBoost = Math.min(20, Math.round(Math.log10((row.views ?? 0) + 1) * 8));

  return titleExactBoost + summaryBoost + tagBoost + typoToleranceBoost + freshnessBoost + popularityBoost;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const query = params.q ?? "";
  const category = params.category ?? "All";
  const sort = params.sort ?? (query ? "relevance" : "latest");
  const date = params.date ?? "";
  const format = params.format ?? "all";

  let articles:
    | Array<{
        id: string;
        title: string;
        slug: string;
        summary: string | null;
        tags: string[];
        featured_image: string | null;
        category: string;
        published_at: string | null;
        views: number;
        read_time: number;
        video_url: string | null;
        relevanceScore?: number;
      }>
    | null = [];

  if (supabase) {
    let builder = supabase
      .from("articles")
      .select("id,title,slug,summary,tags,featured_image,published_at,views,read_time,video_url,categories(name)")
      .eq("status", "published");

    if (category !== "All") builder = builder.eq("categories.name", category);
    if (date) builder = builder.gte("published_at", date);
    if (format === "video") builder = builder.not("video_url", "is", null);
    if (format === "article") builder = builder.is("video_url", null);

    if (!query) {
      builder =
        sort === "popular"
          ? builder.order("views", { ascending: false })
          : builder.order("published_at", { ascending: false });
    } else {
      builder = builder.order("published_at", { ascending: false });
    }

    const { data } = await builder.limit(query ? 160 : 40);
    const mapped = ((data ?? []) as NewsQueryRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      summary: row.summary,
      tags: row.tags ?? [],
      featured_image: row.featured_image,
      category: row.categories?.[0]?.name ?? "News",
      published_at: row.published_at,
      views: row.views ?? 0,
      read_time: row.read_time ?? 1,
      video_url: row.video_url,
    }));

    if (query) {
      const ranked = mapped
        .map((row) => ({ ...row, relevanceScore: computeRelevance(query, row) }))
        .filter((row) => row.relevanceScore >= 12);

      articles =
        sort === "latest"
          ? ranked.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? "")).slice(0, 40)
          : sort === "popular"
            ? ranked.sort((a, b) => b.views - a.views).slice(0, 40)
            : ranked.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)).slice(0, 40);
    } else {
      articles = mapped;
    }
  }

  const trending = (articles ?? []).slice().sort((a, b) => b.views - a.views).slice(0, 5);

  const categoryHubs = [
    "News",
    "Politics",
    "Entertainment",
    "Sports",
    "Business",
    "Technology",
    "Culture",
  ] as const;

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label="News discovery content" className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            ...(category !== "All" ? [{ label: category }] : []),
          ]}
        />
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Browse by category">
          {categoryHubs.map((name) => (
            <Link
              key={name}
              href={`/news/category/${name.toLowerCase()}`}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wider transition ${
                category === name
                  ? "border-red-400/60 bg-red-950/40 text-red-200"
                  : "border-white/15 bg-white/[0.04] text-white/80 hover:border-red-400/40 hover:text-red-200"
              }`}
            >
              {name}
            </Link>
          ))}
        </nav>
        <section id="news-search" className="ui-card density-card scroll-mt-28">
          <h1 className="text-3xl font-semibold">Search & Discovery</h1>
          <p className="ui-muted mt-1 text-xs">
            Last updated on load · Refine with query, category, ranking, date, and format.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search title, summary, or tags (typo-tolerant)..."
              className="ui-surface rounded-lg px-3 py-2"
            />
            <select name="category" defaultValue={category} className="ui-surface rounded-lg px-3 py-2">
              <option>All</option>
              <option>News</option>
              <option>Politics</option>
              <option>Entertainment</option>
              <option>Sports</option>
              <option>Business</option>
              <option>Technology</option>
              <option>Culture</option>
            </select>
            <select name="sort" defaultValue={sort} className="ui-surface rounded-lg px-3 py-2">
              <option value="latest">Latest</option>
              <option value="popular">Popularity</option>
              <option value="relevance">Relevance</option>
            </select>
            <select name="format" defaultValue={format} className="ui-surface rounded-lg px-3 py-2">
              <option value="all">All formats</option>
              <option value="article">Articles</option>
              <option value="video">Video stories</option>
            </select>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="ui-surface rounded-lg px-3 py-2"
            />
          </form>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <article className="ui-card density-card">
            <h2 className="text-lg font-semibold">Latest news feed</h2>
            <div className="mt-3 space-y-2">
              {(articles ?? []).map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="home-list-card block rounded-lg border px-3 py-3"
                >
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      width={960}
                      height={540}
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="mb-2 h-36 w-full rounded-md object-cover"
                    />
                  ) : null}
                  <p className="font-medium">{article.title}</p>
                  <p className="ui-muted mt-1 text-xs">
                    {article.category} - {article.views} views - {article.read_time} min read
                    {article.video_url ? " - Video" : " - Article"}
                  </p>
                </Link>
              ))}
            </div>
          </article>
          <aside className="space-y-5" aria-label="News discovery sidebar">
            <article className="ui-card density-card">
              <h3 className="text-sm uppercase tracking-[0.2em] text-red-300">Trending now</h3>
              <div className="mt-2 space-y-2">
                {trending.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`} className="block text-sm hover:text-red-300">
                    {item.title}
                  </Link>
                ))}
              </div>
            </article>
            <article className="ui-card density-card">
              <h3 className="text-sm uppercase tracking-[0.2em] text-red-300">Recommended for you</h3>
              <p className="ui-muted mt-2 text-sm">
                Personalized recommendations based on engagement and followed categories.
              </p>
            </article>
          </aside>
        </section>
      </main>
    </div>
  );
}
