"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/auth/roles";

interface UserRow {
  id: string;
  name: string | null;
  role: UserRole;
}

export function UserManager() {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!supabase) return [] as UserRow[];
      const { data } = await supabase
        .from("users")
        .select("id,name,role")
        .order("created_at", { ascending: false })
        .limit(60);
      return (data ?? []) as UserRow[];
    },
  });

  async function updateRole(id: string, role: UserRole) {
    if (!supabase) return;
    await supabase.from("users").update({ role }).eq("id", id);
    await queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  return (
    <section className="ui-card density-card">
      <h2 className="text-lg font-semibold">User management</h2>
      <div className="mt-3 space-y-2">
        {users.map((profile) => (
          <article
            key={profile.id}
            className="home-list-card flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{profile.name ?? "Unnamed user"}</p>
              <p className="ui-muted text-xs">{profile.id}</p>
            </div>
            <select
              value={profile.role}
              onChange={(event) => updateRole(profile.id, event.target.value as UserRole)}
              className="ui-surface rounded-md px-2 py-1 text-xs"
            >
              <option value="journalist">Journalist</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </article>
        ))}
      </div>
    </section>
  );
}
