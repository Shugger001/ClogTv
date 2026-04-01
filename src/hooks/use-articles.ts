"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NewsItem } from "@/types/news";

const queryKey = ["articles"];

interface ArticleQueryRow {
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

export function useArticles() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!supabase) return [] as NewsItem[];
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return ((data ?? []) as ArticleQueryRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        summary: row.summary,
        featured_image: row.featured_image,
        category: row.categories?.[0]?.name ?? "News",
        tags: row.tags ?? [],
        priority: (row.priority ?? "top") as NewsItem["priority"],
        status: row.status,
        is_breaking: row.is_breaking ?? false,
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
    },
  });
}

export function useArticleMutations() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();

  return {
    async upsertArticle(payload: Partial<NewsItem> & Pick<NewsItem, "title" | "category" | "status">) {
      if (!supabase) throw new Error("Supabase client unavailable.");

      const slug =
        payload.slug ??
        payload.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 80);

      const article = {
        title: payload.title,
        slug,
        content: payload.content ?? "",
        summary: payload.summary ?? null,
        featured_image: payload.featured_image ?? null,
        category_id: null as string | null,
        tags: payload.tags ?? [],
        status: payload.status,
        is_breaking: payload.is_breaking ?? false,
        priority: payload.is_breaking ? "breaking" : payload.priority ?? "top",
        live_stream_url: payload.live_stream_url ?? null,
        video_url: payload.video_url ?? null,
        video_provider: payload.video_provider ?? null,
        read_time: payload.read_time ?? 3,
        scheduled_for: payload.status === "scheduled" ? payload.scheduled_for ?? new Date().toISOString() : null,
        published_at: payload.status === "published" ? new Date().toISOString() : null,
      };

      const { data: categoryRow } = await supabase
        .from("categories")
        .select("id")
        .eq("name", payload.category)
        .maybeSingle();

      if (categoryRow?.id) {
        article.category_id = categoryRow.id;
      }

      if (payload.id) {
        const { error } = await supabase.from("articles").update(article).eq("id", payload.id);
        if (error) throw error;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error } = await supabase.from("articles").insert({
          ...article,
          author_id: user?.id,
        });
        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey });
    },

    async removeArticle(id: string) {
      if (!supabase) return;
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey });
    },
  };
}
