import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATIC_PATHS: MetadataRoute.Sitemap = [
  "/",
  "/news",
  "/search",
  "/about",
  "/watch-live",
  "/contact",
  "/legal",
  "/sitemap",
  "/terms",
  "/privacy",
  "/cookies",
  "/accessibility",
].map((path) => ({
  url: `${getSiteUrl()}${path}`,
  changeFrequency: path === "/" ? "hourly" : "daily",
  priority: path === "/" ? 1 : 0.7,
}));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [...STATIC_PATHS];

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: rows } = await supabase
      .from("articles")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2000);

    for (const row of rows ?? []) {
      if (!row.slug) continue;
      const lastMod = row.updated_at ?? row.published_at;
      entries.push({
        url: `${base}/news/${row.slug}`,
        lastModified: lastMod ? new Date(lastMod) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
