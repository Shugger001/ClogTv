"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface BookmarkButtonProps {
  articleId: string;
}

export function BookmarkButton({ articleId }: BookmarkButtonProps) {
  const supabase = createSupabaseBrowserClient();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadBookmark() {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();
      setBookmarked(Boolean(data?.id));
    }
    void loadBookmark();
  }, [articleId, supabase]);

  async function toggleBookmark() {
    if (!supabase) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      if (bookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("article_id", articleId);
        setBookmarked(false);
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, article_id: articleId });
        setBookmarked(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={toggleBookmark} disabled={loading} className="btn-secondary">
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
