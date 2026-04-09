import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminOverviewStats {
  totalViews: number;
  publishedArticles: number;
  mediaAssets: number;
  totalComments: number;
  notificationsCount: number;
}

export async function getAdminOverviewStats(supabase: SupabaseClient): Promise<AdminOverviewStats> {
  try {
    const [published, media, comments, notifications, viewsRows] = await Promise.all([
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("media").select("*", { count: "exact", head: true }),
      supabase.from("comments").select("*", { count: "exact", head: true }),
      supabase.from("notifications").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("views").eq("status", "published").limit(20000),
    ]);

    const totalViews = (viewsRows.data ?? []).reduce((sum, row) => sum + (Number(row.views) || 0), 0);

    return {
      totalViews,
      publishedArticles: published.count ?? 0,
      mediaAssets: media.count ?? 0,
      totalComments: comments.count ?? 0,
      notificationsCount: notifications.count ?? 0,
    };
  } catch {
    return {
      totalViews: 0,
      publishedArticles: 0,
      mediaAssets: 0,
      totalComments: 0,
      notificationsCount: 0,
    };
  }
}
