import type { Metadata } from "next";
import Image from "next/image";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleReadingProgress } from "@/components/article-reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarkButton } from "@/components/bookmark-button";
import { Header } from "@/components/header";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ArticleNewsletterExitIntent } from "@/components/article-newsletter-funnel";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CommentsSection = dynamic(
  () => import("@/components/comments-section").then((mod) => mod.CommentsSection),
  { loading: () => <div className="ui-card density-card h-40 animate-pulse" /> },
);

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface ArticleAuthor {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
}

interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  featured_image: string | null;
  status: string;
  views: number;
  read_time: number;
  video_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  tags: string[] | null;
  categories: Array<{ name?: string }> | { name?: string } | null;
  users: ArticleAuthor | null;
}

function absoluteImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = getSiteUrl();
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { title: "Article" };

  const { data: article } = await supabase
    .from("articles")
    .select("title, summary, featured_image, published_at, updated_at, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!article || article.status !== "published") {
    return { title: "Article" };
  }

  const base = getSiteUrl();
  const url = `${base}/news/${slug}`;
  const description =
    article.summary?.trim() ||
    `${article.title} — ClogTv News.`;
  const ogImage = absoluteImageUrl(article.featured_image);

  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function resolveCategoryName(categories: unknown): string {
  if (Array.isArray(categories)) {
    const first = categories[0] as { name?: string } | undefined;
    return first?.name ?? "News";
  }
  if (categories && typeof categories === "object" && "name" in categories) {
    return String((categories as { name: string }).name);
  }
  return "News";
}

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function splitStoryBlocks(content: string): string[] {
  return content
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: article } = await supabase
    .from("articles")
    .select("*, categories(name), users:author_id(id,name,role,avatar_url)")
    .eq("slug", slug)
    .maybeSingle<ArticleWithRelations>();

  if (!article) notFound();

  await supabase.rpc("increment_article_views", {
    article_slug: slug,
    viewer: user?.id ?? null,
    session: null,
  });

  const { data: related } = await supabase
    .from("articles")
    .select("id,title,slug,status")
    .eq("status", "published")
    .neq("id", article.id)
    .limit(4);

  const categoryName = resolveCategoryName(article.categories);
  const titleShort =
    article.title.length > 56 ? `${article.title.slice(0, 56)}…` : article.title;
  const publishedAt = formatDateTime(article.published_at);
  const updatedAt = formatDateTime(article.updated_at);
  const storyBlocks = splitStoryBlocks(article.content);
  const topics = (article.tags ?? []).slice(0, 6);
  const authorName = article.users?.name?.trim() || "ClogTv News Desk";
  const authorRole = article.users?.role ? `${article.users.role} desk` : "Editorial team";
  const authorProfileHref = article.users?.id ? `/journalists/${article.users.id}` : null;
  const sourceLinks = [
    article.video_url
      ? {
          label: "Primary video source",
          href: article.video_url,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <div className="min-h-screen text-foreground">
      <ArticleReadingProgress />
      <Header />
      <main
        id="main-content"
        aria-label="Article content"
        className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_300px]"
      >
        <article id="article-body" className="ui-card density-card">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "News", href: "/news" },
              {
                label: categoryName,
                href: `/news?category=${encodeURIComponent(categoryName)}`,
              },
              { label: titleShort },
            ]}
          />
          <div className="mb-4 border-b border-[color:var(--border)] pb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">{categoryName}</p>
            <h1 className="headline-display mt-2 text-4xl font-semibold leading-tight">{article.title}</h1>
            <p className="ui-muted mt-2 text-sm uppercase tracking-[0.14em]">
              By ClogTv News Desk | {article.views} views | {article.read_time} min read
            </p>
            <div className="ui-muted mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.13em]">
              {publishedAt ? <span>Published {publishedAt}</span> : null}
              {publishedAt && updatedAt ? <span>|</span> : null}
              {updatedAt ? <span>Last updated {updatedAt}</span> : null}
            </div>
            {article.summary ? <p className="ui-muted mt-3 max-w-3xl text-base leading-7">{article.summary}</p> : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <BookmarkButton articleId={article.id} />
              <Link
                href={`/news?category=${encodeURIComponent(categoryName)}`}
                className="text-xs uppercase tracking-[0.16em] text-red-300/90 underline-offset-4 hover:underline"
              >
                More in {categoryName}
              </Link>
            </div>
          </div>
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              width={1200}
              height={675}
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="max-h-[420px] w-full rounded-xl object-cover"
            />
          ) : null}
          <section className="mt-5 space-y-5">
            <div className="rounded-lg border border-[color:var(--border)] bg-black/10 p-4">
              <p className="kicker">Byline</p>
              <p className="mt-1 text-sm">
                {authorName}{" "}
                <span className="ui-muted uppercase tracking-[0.1em]">({authorRole})</span>
              </p>
              {authorProfileHref ? (
                <Link href={authorProfileHref} className="mt-2 inline-block text-xs uppercase tracking-[0.16em] text-red-300/90 hover:underline">
                  View journalist profile
                </Link>
              ) : null}
            </div>
            {storyBlocks.map((block, index) => (
              <div key={`${article.id}-${index}`} className="space-y-4">
                <p className="whitespace-pre-wrap font-sans text-[1.03rem] leading-8">{block}</p>
                {index === 0 || index === 1 ? (
                  <NewsletterSignup
                    source={`article_inline_${index + 1}`}
                    compact
                    title="Get breaking updates from this storyline"
                    description="Subscribe for fast alerts and our editor's briefing."
                  />
                ) : null}
              </div>
            ))}
          </section>
          {sourceLinks.length ? (
            <section className="mt-6 border-t border-[color:var(--border)] pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-300">Sources</p>
              <ul className="mt-2 space-y-2">
                {sourceLinks.map((source) => (
                  <li key={source.href}>
                    <a className="text-sm underline" href={source.href} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {article.video_url ? (
            <div className="mt-6 border-t border-[color:var(--border)] pt-4">
              <p className="text-xs uppercase tracking-[0.2em] text-red-300">Video</p>
              <a className="text-sm underline" href={article.video_url} target="_blank" rel="noreferrer">
                Open video source
              </a>
            </div>
          ) : null}
          <div className="mt-8">
            <CommentsSection articleId={article.id} />
          </div>
        </article>

        <aside className="space-y-5" aria-label="Related story sidebar">
          <section className="ui-card density-card">
            <div className="mb-3 flex items-center justify-between border-b border-[color:var(--border)] pb-2">
              <h2 className="kicker">More on this story</h2>
              <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {(related ?? []).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="block rounded-md px-1 py-1.5 text-sm transition hover:bg-black/5 hover:text-red-300"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
          <section className="ui-card density-card">
            <h2 className="kicker">Related topics</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {topics.length ? (
                topics.map((tag) => (
                  <Link
                    key={tag}
                    href={`/news?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.12em] hover:border-red-300/40 hover:text-red-200"
                  >
                    {tag}
                  </Link>
                ))
              ) : (
                <Link
                  href={`/news?category=${encodeURIComponent(categoryName)}`}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.12em] hover:border-red-300/40 hover:text-red-200"
                >
                  {categoryName}
                </Link>
              )}
            </div>
          </section>
        </aside>
      </main>
      <BackToTop />
      <ArticleNewsletterExitIntent />
    </div>
  );
}
