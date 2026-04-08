"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useArticles } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";

function storyLabel(story: {
  is_breaking?: boolean;
  priority?: string;
  tags?: string[];
  video_url?: string | null;
}) {
  if (story.is_breaking || story.priority === "breaking") return "Live";
  if (story.tags?.some((tag) => tag.toLowerCase() === "analysis")) return "Analysis";
  if (story.tags?.some((tag) => tag.toLowerCase() === "explainer")) return "Explainer";
  if (story.video_url) return "Video";
  return null;
}

export function HomepageSections() {
  const { data = [], isLoading } = useArticles();

  const published = useMemo(
    () => data.filter((article) => article.status === "published").slice(0, 24),
    [data],
  );
  const topStories = published.slice(0, 6);
  const latest = published.slice(6, 14);
  const trending = published.slice().sort((a, b) => b.views - a.views).slice(0, 5);
  const videoStories = published.filter((item) => Boolean(item.video_url)).slice(0, 4);
  const categoryHighlights = ["News", "Politics", "Entertainment", "Sports", "Business", "Technology"]
    .map((category) => ({
      category,
      story: published.find((item) => item.category === category),
    }))
    .filter((item) => Boolean(item.story));

  return (
    <div className="space-y-5">
      <section className="ui-card density-card">
        <div className="editorial-section-head">
          <h2 className="kicker">Top stories</h2>
          <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
            See all
          </Link>
        </div>
        <div className="editorial-content-flow flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0 md:snap-none md:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="home-list-card min-w-[260px] rounded-lg border px-3 py-3 md:min-w-0">
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="mt-2 h-3 w-2/5" />
                </div>
              ))
            : null}
          {topStories.map((story) => (
            <Link
              key={story.id}
              href={`/news/${story.slug}`}
              className="home-list-card min-w-[260px] snap-start rounded-lg border px-3 py-3 md:min-w-0"
            >
              {story.featured_image ? (
                <Image
                  src={story.featured_image}
                  alt={story.title}
                  width={640}
                  height={360}
                  sizes="(max-width: 768px) 260px, (max-width: 1200px) 33vw, 28vw"
                  className="mb-2 h-32 w-full rounded-md object-cover"
                />
              ) : null}
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">{story.category}</p>
                {storyLabel(story) ? <span className="story-badge">{storyLabel(story)}</span> : null}
              </div>
              <p className="headline-compact story-title-clamp-2 mt-1 font-medium">{story.title}</p>
              <p className="story-meta-row mt-1">
                {story.published_at
                  ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                  : "Updated recently"}
                <span className="mx-1 text-[10px]">|</span>
                {Math.max(story.read_time ?? 1, 1)} min read
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="density-grid grid lg:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          className="ui-card density-card"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.28 }}
        >
          <div className="editorial-section-head">
            <h2 className="kicker">Latest updates</h2>
            <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
              Live feed
            </Link>
          </div>
          <div className="editorial-content-flow space-y-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="home-list-card block rounded-lg border px-3 py-3">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                ))
              : null}
            {latest.map((story) => (
              <Link key={story.id} href={`/news/${story.slug}`} className="home-list-card block rounded-lg border px-3 py-3">
                {story.featured_image ? (
                  <Image
                    src={story.featured_image}
                    alt={story.title}
                    width={640}
                    height={360}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="mb-2 h-28 w-full rounded-md object-cover"
                  />
                ) : null}
                <div className="flex items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-red-300">{story.category}</p>
                  {storyLabel(story) ? <span className="story-badge">{storyLabel(story)}</span> : null}
                </div>
                <p className="headline-compact story-title-clamp-2 mt-1 font-medium">{story.title}</p>
                <p className="story-meta-row mt-1">
                  {story.published_at
                    ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                    : "Updated recently"}
                  <span className="mx-1 text-[10px]">|</span>
                  {Math.max(story.read_time ?? 1, 1)} min read
                </p>
              </Link>
            ))}
          </div>
        </motion.article>
        <article className="ui-card density-card">
          <div className="editorial-section-head">
            <h2 className="kicker">Most read</h2>
            <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
              This hour
            </Link>
          </div>
          <div className="editorial-content-flow story-list-tight space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-4 w-full" />)
              : null}
            {trending.map((story, index) => (
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
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="ui-card density-card">
        <div className="editorial-section-head">
          <h2 className="kicker">Sections</h2>
          <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
            Browse
          </Link>
        </div>
        <div className="editorial-content-flow grid gap-3 md:grid-cols-3">
          {categoryHighlights.map(({ category, story }) => (
            <Link
              key={category}
              href={`/news/${story?.slug}`}
              className="home-list-card rounded-lg border px-3 py-3"
            >
              {story?.featured_image ? (
                <Image
                  src={story.featured_image}
                  alt={story.title}
                  width={640}
                  height={360}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="mb-2 h-24 w-full rounded-md object-cover"
                />
              ) : null}
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.2em] text-red-300">{category}</p>
                {storyLabel(story ?? {}) ? <span className="story-badge">{storyLabel(story ?? {})}</span> : null}
              </div>
              <p className="story-title-clamp-2 mt-1 text-sm font-medium">{story?.title}</p>
              <p className="story-meta-row mt-1 text-xs">
                {story?.published_at
                  ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                  : "Updated recently"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="ui-card density-card">
        <div className="editorial-section-head">
          <h2 className="kicker">Video and clips</h2>
          <Link href="/watch-live" className="ui-muted text-xs uppercase tracking-[0.18em] hover:text-foreground">
            Watch live
          </Link>
        </div>
        <div className="editorial-content-flow grid gap-3 md:grid-cols-2">
          {videoStories.map((story) => (
            <Link key={story.id} href={`/news/${story.slug}`} className="home-list-card rounded-lg border px-3 py-3">
              {story.featured_image ? (
                <Image
                  src={story.featured_image}
                  alt={story.title}
                  width={640}
                  height={360}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="mb-2 h-28 w-full rounded-md object-cover"
                />
              ) : null}
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-[0.2em] text-red-300">Video</p>
                <span className="story-badge">{story.video_provider ?? "external"}</span>
              </div>
              <p className="story-title-clamp-2 mt-1 font-medium">{story.title}</p>
              <p className="story-meta-row mt-1 text-xs">
                {story.published_at
                  ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                  : "Updated recently"}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
