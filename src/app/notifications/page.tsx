import { Header } from "@/components/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  let notifications: Array<{ id: string; title: string; body: string; created_at: string }> = [];

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("id,title,body,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      notifications = data ?? [];
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" aria-label="Notifications content" className="mx-auto max-w-5xl px-6 py-8">
        <section className="ui-card density-card">
          <p className="text-xs uppercase tracking-[0.2em] text-red-300">Notifications</p>
          <h1 className="mt-2 text-3xl font-semibold">Breaking alerts</h1>
          <div className="mt-4 space-y-2">
            {notifications.length === 0 ? (
              <p className="ui-muted text-sm">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <article key={item.id} className="home-list-card rounded-lg border px-3 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="ui-muted mt-1 text-sm">{item.body}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
