"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useBreakingNews } from "@/hooks/use-breaking-news";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewsroomStore } from "@/store/newsroom-store";

export function EditorialBoard() {
  const { data, isLoading } = useBreakingNews();
  const { selectedStory, setSelectedStory } = useNewsroomStore();

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="editorial-section-head">
        <h2 className="kicker">Editorial Desk</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="home-list-card rounded-xl border border-white/10 px-3.5 py-3.5">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="mt-2 h-3 w-2/5" />
                </div>
              ))
            : null}
          {data?.slice(0, 6).map((story) => (
            <button
              type="button"
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="home-list-card w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3.5 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <p className="headline-compact text-sm font-medium text-foreground">{story.title}</p>
              <p className="story-meta-row mt-1">
                {story.category} -{" "}
                {story.published_at
                  ? formatDistanceToNow(new Date(story.published_at), { addSuffix: true })
                  : "Not published"}
              </p>
            </button>
          ))}
        </div>
        <motion.article
          className="home-focus-card rounded-xl border border-white/10 bg-black/25 p-4"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-xs uppercase tracking-widest text-red-300">Story Focus</p>
          <h3 className="headline-compact mt-2 text-lg font-medium text-foreground">
            {selectedStory?.title ?? "Select a story to preview editorial context"}
          </h3>
          <p className="ui-muted mt-3 text-sm leading-6">
            {selectedStory?.content ??
              "Your editorial team can assign correspondents, update legal review status, and trigger push alerts from this pane."}
          </p>
        </motion.article>
      </div>
    </section>
  );
}
