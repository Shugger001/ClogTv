export type NewsPriority = "breaking" | "top" | "feature";
export type ArticleStatus = "draft" | "review" | "scheduled" | "published";
export type ArticleCategory =
  | "News"
  | "Politics"
  | "Entertainment"
  | "Sports"
  | "Business"
  | "Technology";

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  standfirst?: string | null;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  category: ArticleCategory | string;
  tags: string[];
  priority: NewsPriority;
  status: ArticleStatus;
  is_breaking: boolean;
  video_url: string | null;
  video_provider: string | null;
  live_stream_url: string | null;
  author_id: string;
  views: number;
  read_time: number;
  scheduled_for?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
}
