"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useArticles } from "@/hooks/use-articles";
import { Skeleton } from "@/components/ui/skeleton";

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
        <h2 className="kicker">Top stories grid</h2>
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-1 md:grid md:overflow-visible md:pb-0 md:snap-none md:grid-cols-3">
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
              <p className="headline-compact font-medium">{story.title}</p>
              <p className="ui-muted mt-1 text-xs">{story.category}</p>
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
          <h2 className="kicker">Latest feed</h2>
          <div className="mt-3 space-y-2">
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
                <p className="headline-compact font-medium">{story.title}</p>
                <p className="ui-muted mt-1 text-xs">{story.category}</p>
              </Link>
            ))}
          </div>
        </motion.article>
        <article className="ui-card density-card">
          <h2 className="kicker">Trending sidebar</h2>
          <div className="mt-3 space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-4 w-full" />)
              : null}
            {trending.map((story) => (
              <Link key={story.id} href={`/news/${story.slug}`} className="block text-sm hover:text-red-300">
                {story.title}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="ui-card density-card">
        <h2 className="kicker">Category sections</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
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
              <p className="text-xs uppercase tracking-[0.2em] text-red-300">{category}</p>
              <p className="mt-1 text-sm font-medium">{story?.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="ui-card density-card">
        <h2 className="kicker">Video section</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
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
              <p className="font-medium">{story.title}</p>
              <p className="ui-muted mt-1 text-xs">{story.video_provider ?? "external"} video</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
