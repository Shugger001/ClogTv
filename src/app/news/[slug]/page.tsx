import Image from "next/image";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
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

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <article className="ui-card density-card">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">
            {article.categories?.[0]?.name ?? "News"}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{article.title}</h1>
          <p className="ui-muted mt-2 text-sm">
            {article.views} views - {article.read_time} min read
          </p>
          {article.summary ? <p className="ui-muted mt-3 text-base leading-7">{article.summary}</p> : null}
          <div className="mt-4">
            <BookmarkButton articleId={article.id} />
          </div>
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              width={1200}
              height={675}
              className="mt-4 max-h-[420px] w-full rounded-xl object-cover"
            />
          ) : null}
          <pre className="mt-4 whitespace-pre-wrap font-sans leading-7">{article.content}</pre>
          {article.video_url ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-red-300">Video</p>
              <a className="text-sm underline" href={article.video_url} target="_blank" rel="noreferrer">
                Open video source
              </a>
            </div>
          ) : null}
        </article>

        <div className="mt-6">
          <CommentsSection articleId={article.id} />
        </div>
      </main>
    </div>
  );
}
