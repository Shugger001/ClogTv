"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NewsItem } from "@/types/news";

const supabase = createSupabaseBrowserClient();
const queryKey = ["breaking-news"];
interface BreakingQueryRow {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  featured_image: string | null;
  categories: Array<{ name: string }> | null;
  tags: string[] | null;
  priority: string | null;
  status: NewsItem["status"];
  is_breaking: boolean | null;
  video_url: string | null;
  video_provider: string | null;
  live_stream_url: string | null;
  author_id: string;
  views: number | null;
  read_time: number | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
}
const fallbackStories: NewsItem[] = [
  {
    id: "local-1",
    title: "Global markets react as energy summit enters emergency session",
    slug: "global-markets-energy-summit",
    content: "Senior editors monitoring policy updates across regions.",
    featured_image: null,
    category: "Business",
    tags: ["markets", "energy"],
    priority: "breaking",
    status: "published",
    is_breaking: true,
    video_url: null,
    video_provider: null,
    live_stream_url: null,
    author_id: "system",
    views: 0,
    read_time: 3,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

async function fetchBreakingNews() {
  if (!supabase) {
    return fallbackStories;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name)")
    .eq("status", "published")
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(12);

  if (error) {
    throw error;
  }

  return ((data ?? []) as BreakingQueryRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    summary: row.summary,
    featured_image: row.featured_image,
    category: row.categories?.[0]?.name ?? "News",
    tags: row.tags ?? [],
    priority: (row.priority ?? "breaking") as NewsItem["priority"],
    status: row.status,
    is_breaking: row.is_breaking ?? true,
    video_url: row.video_url ?? null,
    video_provider: row.video_provider ?? null,
    live_stream_url: row.live_stream_url ?? null,
    author_id: row.author_id,
    views: row.views ?? 0,
    read_time: row.read_time ?? 1,
    scheduled_for: row.scheduled_for,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at ?? undefined,
  }));
}

export function useBreakingNews() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const channelName = `breaking-news-feed-${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        async () => {
          await queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey,
    queryFn: fetchBreakingNews,
  });
}
