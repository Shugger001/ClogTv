"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface MediaRow {
  id: string;
  url: string;
  type: "image" | "video";
}

export function MediaLibrary() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: assets = [] } = useQuery({
    queryKey: ["media-assets"],
    queryFn: async () => {
      if (!supabase) return [] as MediaRow[];
      const { data } = await supabase
        .from("media")
        .select("id,url,type")
        .order("id", { ascending: false })
        .limit(50);
      return (data ?? []) as MediaRow[];
    },
  });

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !file) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const path = `uploads/${Date.now()}-${file.name}`;
    await supabase.storage.from("media").upload(path, file, { upsert: false });
    await supabase.from("media").insert({
      url: path,
      type: file.type.startsWith("video/") ? "video" : "image",
      uploaded_by: user.id,
    });

    setFile(null);
    await queryClient.invalidateQueries({ queryKey: ["media-assets"] });
  }

  return (
    <section className="ui-card density-card">
      <h2 className="text-lg font-semibold">Media library</h2>
      <form onSubmit={upload} className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
        <input
          type="file"
          accept="video/*,image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="ui-surface rounded-lg px-3 py-2"
        />
        <button className="btn-primary">Upload</button>
      </form>
      <div className="mt-3 space-y-2">
        {assets.map((asset) => (
          <article key={asset.id} className="home-list-card rounded-lg border px-3 py-3">
            <p className="text-sm font-medium">{asset.url.split("/").pop() ?? "Uploaded asset"}</p>
            <p className="ui-muted mt-1 text-xs">
              {asset.type} - {asset.url}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
