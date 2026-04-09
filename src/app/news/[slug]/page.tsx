import Image from "next/image";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleReadingProgress } from "@/components/article-reading-progress";
import { BackToTop } from "@/components/back-to-top";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BookmarkButton } from "@/components/bookmark-button";
import { Header } from "@/components/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const CommentsSection = dynamic(
  () => import("@/components/comments-section").then((mod) => mod.CommentsSection),
  { loading: () => <div className="ui-card density-card h-40 animate-pulse" /> },
);

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: article } = await supabase
    .from("articles")
    .select("*, categories(name)")
    .eq("slug", slug)
    .maybeSingle();

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
              className="max-h-[420px] w-full rounded-xl object-cover"
            />
          ) : null}
          <pre className="mt-5 whitespace-pre-wrap font-sans text-[1.03rem] leading-8">{article.content}</pre>
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
        </aside>
      </main>
      <BackToTop />
    </div>
  );
}
