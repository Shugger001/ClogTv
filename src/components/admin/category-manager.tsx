"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
}

export function CategoryManager() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!supabase) return [] as CategoryRow[];
      const { data } = await supabase.from("categories").select("id,name,slug").order("name");
      return (data ?? []) as CategoryRow[];
    },
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
    await supabase.from("categories").upsert({ name: name.trim(), slug });
    setName("");
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  return (
    <section className="ui-card density-card">
      <h2 className="text-lg font-semibold">Category manager</h2>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Add category"
          className="ui-surface flex-1 rounded-lg px-3 py-2"
        />
        <button className="btn-primary">Add</button>
      </form>
      <div className="mt-3 space-y-2">
        {categories.map((item) => (
          <article key={item.id} className="home-list-card rounded-lg border px-3 py-2 text-sm">
            {item.name} <span className="ui-muted">({item.slug})</span>
          </article>
        ))}
      </div>
    </section>
  );
}
