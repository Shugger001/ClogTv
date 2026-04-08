"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { useArticles } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeMostReadRail() {
  const { data = [], isLoading } = useArticles();

  const mostRead = useMemo(
    () =>
      data
        .filter((article) => article.status === "published")
        .sort((a, b) => b.views - a.views)
        .slice(0, 8),
    [data],
  );

  return (
    <section className="ui-card density-card">
      <div className="editorial-section-head">
        <h2 className="kicker">Most read</h2>
        <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
          Today
        </Link>
      </div>
      <div className="editorial-content-flow story-list-tight space-y-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
          : null}
        {mostRead.map((story, index) => (
          <Link
            key={story.id}
            href={`/news/${story.slug}`}
            className="flex items-start gap-3 rounded-md px-1 py-1.5 transition hover:bg-black/5 hover:text-red-300"
          >
            <span className="mt-0.5 text-xs font-semibold text-red-300">{index + 1}</span>
            <span>
              <span className="story-title-clamp-2 text-sm">{story.title}</span>
              <span className="story-meta-row block text-[11px]">
                {story.published_at
                  ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                  : "Updated recently"}
                <span className="mx-1 text-[10px]">|</span>
                {Math.max(story.read_time ?? 1, 1)} min
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

