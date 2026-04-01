"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useArticles, useArticleMutations } from "@/hooks/use-articles";
import { NEWS_CATEGORIES } from "@/lib/news/constants";
import { NewsItem } from "@/types/news";
import { ArticleEditor } from "./article-editor";

export function ArticlesManager() {
  const { data = [], isLoading } = useArticles();
  const { removeArticle } = useArticleMutations();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<NewsItem | null>(null);

  const filtered = useMemo(() => {
    return data.filter((article) => {
      const inCategory = category === "All" || article.category === category;
      const inQuery =
        !query ||
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        (article.tags ?? []).some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
      return inCategory && inQuery;
    });
  }, [data, category, query]);

  return (
    <section className="density-grid grid lg:grid-cols-[1fr_1.2fr]">
      <article className="ui-card density-card">
        <h2 className="text-lg font-semibold">Articles manager</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title or tags"
            className="ui-surface rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="ui-surface rounded-lg px-3 py-2 text-sm"
          >
            <option value="All">All categories</option>
            {NEWS_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 space-y-2">
          {isLoading ? (
            <p className="ui-muted text-sm">Loading articles...</p>
          ) : (
            filtered.slice(0, 20).map((article) => (
              <div key={article.id} className="ui-surface rounded-lg px-3 py-3">
                <button
                  type="button"
                  onClick={() => setSelected(article)}
                  className="w-full text-left"
                >
                  <p className="text-sm font-medium">{article.title}</p>
                  <p className="ui-muted mt-1 text-xs">
                    {article.category} - {article.status} - {article.views} views
                  </p>
                </button>
                <div className="mt-2 flex justify-between">
                  <p className="ui-muted text-xs">
                    {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-red-400"
                    onClick={async () => {
                      await removeArticle(article.id);
                      if (selected?.id === article.id) setSelected(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <ArticleEditor article={selected} onSaved={() => setSelected(null)} />
    </section>
  );
}
