"use client";

import { FormEvent, useMemo, useState } from "react";
import { NEWS_CATEGORIES } from "@/lib/news/constants";
import { useArticleMutations } from "@/hooks/use-articles";
import { ArticleCategory, ArticleStatus, NewsItem } from "@/types/news";

interface ArticleEditorProps {
  article?: NewsItem | null;
  onSaved?: () => void;
}

const statusOptions: ArticleStatus[] = ["draft", "review", "scheduled", "published"];

export function ArticleEditor({ article, onSaved }: ArticleEditorProps) {
  const { upsertArticle } = useArticleMutations();

  const [title, setTitle] = useState(article?.title ?? "");
  const [category, setCategory] = useState<ArticleCategory | string>(article?.category ?? "News");
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");
  const [content, setContent] = useState(article?.content ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image ?? "");
  const [tags, setTags] = useState((article?.tags ?? []).join(", "));
  const [isBreaking, setIsBreaking] = useState(Boolean(article?.is_breaking));
  const [videoUrl, setVideoUrl] = useState(article?.video_url ?? "");
  const [scheduledFor, setScheduledFor] = useState(
    article?.scheduled_for ? new Date(article.scheduled_for).toISOString().slice(0, 16) : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const readTime = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  }, [content]);

  function insertMarkdown(snippet: string) {
    setContent((prev) => `${prev}\n${snippet}\n`.trimStart());
  }

  async function suggestHeadline() {
    const response = await fetch("/api/ai/headlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category }),
    });
    const payload = (await response.json()) as { suggestions?: string[] };
    if (payload.suggestions?.[0]) setTitle(payload.suggestions[0]);
  }

  async function createSummary() {
    const response = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const payload = (await response.json()) as { summary?: string };
    if (payload.summary) setSummary(payload.summary);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await upsertArticle({
        id: article?.id,
        title,
        category,
        status,
        content,
        summary: summary || null,
        featured_image: featuredImage || null,
        tags: tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        is_breaking: isBreaking,
        video_url: videoUrl || null,
        video_provider: videoUrl.includes("youtube") ? "youtube" : videoUrl ? "external" : null,
        read_time: readTime,
        scheduled_for: status === "scheduled" && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      });
      setMessage("Article saved.");
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save article.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ui-card density-card space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Article title"
          className="ui-surface rounded-lg px-3 py-2"
          required
        />
        <input
          value={featuredImage}
          onChange={(event) => setFeaturedImage(event.target.value)}
          placeholder="Featured image URL"
          className="ui-surface rounded-lg px-3 py-2"
        />
        <input
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Article summary (for cards/newsletter)"
          className="ui-surface rounded-lg px-3 py-2 md:col-span-2"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="ui-surface rounded-lg px-3 py-2"
        >
          {NEWS_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ArticleStatus)}
          className="ui-surface rounded-lg px-3 py-2"
        >
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="tags,comma,separated"
          className="ui-surface rounded-lg px-3 py-2"
        />

        <input
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="Video URL (YouTube/external)"
          className="ui-surface rounded-lg px-3 py-2"
        />
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(event) => setScheduledFor(event.target.value)}
          placeholder="Schedule date/time"
          className="ui-surface rounded-lg px-3 py-2"
          disabled={status !== "scheduled"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={() => insertMarkdown("# Heading")}>
          H1
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => insertMarkdown("> Pull quote from editor")}
        >
          Quote
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => insertMarkdown("![Image alt](https://image-url)")}>
          Image
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => insertMarkdown("[Embed](https://youtube.com/watch?v=...)")}
        >
          Embed
        </button>
        <button type="button" className="btn-secondary" onClick={suggestHeadline}>
          AI Headline
        </button>
        <button type="button" className="btn-secondary" onClick={createSummary}>
          AI Summary
        </button>
        <label className="ml-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBreaking}
            onChange={(event) => setIsBreaking(event.target.checked)}
          />
          Breaking news
        </label>
        <span className="ui-muted text-xs">Read time: {readTime} min</span>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={14}
        placeholder="Write article content in markdown..."
        className="ui-surface w-full rounded-lg px-3 py-3 font-mono text-sm"
      />

      <div className="flex items-center justify-between">
        <p className="ui-muted text-sm">{message}</p>
        <button type="submit" className="btn-primary" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save article"}
        </button>
      </div>
    </form>
  );
}
