"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CommentsSectionProps {
  articleId: string;
}

interface CommentRow {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export function CommentsSection({ articleId }: CommentsSectionProps) {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: async () => {
      if (!supabase) return [] as CommentRow[];
      const { data } = await supabase
        .from("comments")
        .select("id,content,user_id,created_at")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false })
        .limit(80);
      return (data ?? []) as CommentRow[];
    },
  });

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !body.trim()) return;
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      content: body.trim(),
    });
    setBody("");
    setLoading(false);
    await queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
  }

  async function vote(commentId: string, value: -1 | 1) {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("comment_votes").upsert({
      comment_id: commentId,
      user_id: user.id,
      vote: value,
    });
  }

  return (
    <section className="ui-card density-card">
      <h2 className="text-lg font-semibold">Comments</h2>
      <form onSubmit={submitComment} className="mt-3 space-y-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Join the conversation..."
          className="ui-surface w-full rounded-lg px-3 py-2"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Posting..." : "Post comment"}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {comments.map((comment) => (
          <article key={comment.id} className="home-list-card rounded-lg border px-3 py-3">
            <p className="text-sm">{comment.content}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary !px-2 !py-1 text-xs"
                onClick={() => vote(comment.id, 1)}
              >
                Like
              </button>
              <button
                type="button"
                className="btn-secondary !px-2 !py-1 text-xs"
                onClick={() => vote(comment.id, -1)}
              >
                Dislike
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
