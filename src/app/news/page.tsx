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
    sort?: "latest" | "popular";
    date?: string;
  }>;
}

interface NewsQueryRow {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  published_at: string | null;
  views: number | null;
  read_time: number | null;
  categories: Array<{ name: string }> | null;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const query = params.q ?? "";
  const category = params.category ?? "All";
  const sort = params.sort ?? "latest";
  const date = params.date ?? "";

  let articles:
    | Array<{
        id: string;
        title: string;
        slug: string;
        featured_image: string | null;
        category: string;
        published_at: string | null;
        views: number;
        read_time: number;
      }>
    | null = [];

  if (supabase) {
    let builder = supabase
      .from("articles")
      .select("id,title,slug,featured_image,published_at,views,read_time,categories(name)")
      .eq("status", "published");

    if (query) builder = builder.ilike("title", `%${query}%`);
    if (category !== "All") builder = builder.eq("categories.name", category);
    if (date) builder = builder.gte("published_at", date);
    builder =
      sort === "popular"
        ? builder.order("views", { ascending: false })
        : builder.order("published_at", { ascending: false });

    const { data } = await builder.limit(40);
    articles = ((data ?? []) as NewsQueryRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      featured_image: row.featured_image,
      category: row.categories?.[0]?.name ?? "News",
      published_at: row.published_at,
      views: row.views ?? 0,
      read_time: row.read_time ?? 1,
    }));
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
            Last updated on load · Refine with search, category, sort, or date.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search news..."
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
            </select>
            <select name="sort" defaultValue={sort} className="ui-surface rounded-lg px-3 py-2">
              <option value="latest">Latest</option>
              <option value="popular">Popularity</option>
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
