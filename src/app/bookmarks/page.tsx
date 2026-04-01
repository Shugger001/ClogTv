import Link from "next/link";
import { Header } from "@/components/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BookmarksPage() {
  const supabase = await createSupabaseServerClient();
  type BookmarkedArticle = { id: string; slug: string; title: string; created_at: string };
  interface BookmarkRow {
    articles: BookmarkedArticle[] | null;
  }
  let articles: BookmarkedArticle[] = [];

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("bookmarks")
        .select("articles(id,slug,title,created_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      articles = ((data ?? []) as BookmarkRow[])
        .flatMap((item) => item.articles ?? [])
        .filter((item) => Boolean(item?.id));
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <section className="ui-card density-card">
          <p className="kicker">Bookmarks</p>
          <h1 className="headline-compact mt-2 text-3xl font-semibold">Saved stories</h1>
          <div className="mt-4 space-y-2">
            {articles.length === 0 ? (
              <p className="ui-muted text-sm">No bookmarks yet.</p>
            ) : (
              articles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="home-list-card block rounded-lg border px-3 py-3">
                  <p className="font-medium">{article.title}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
