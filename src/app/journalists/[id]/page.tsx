import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Header } from "@/components/header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface JournalistPageProps {
  params: Promise<{ id: string }>;
}

interface JournalistRow {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
}

interface StoryRow {
  id: string;
  title: string;
  slug: string;
  published_at: string | null;
}

function formatDate(value: string | null): string {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function JournalistPage({ params }: JournalistPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data: journalist } = await supabase.from("users").select("id,name,role,avatar_url").eq("id", id).maybeSingle<JournalistRow>();
  if (!journalist) notFound();

  const { data: stories } = await supabase
    .from("articles")
    .select("id,title,slug,published_at")
    .eq("author_id", id)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(12)
    .returns<StoryRow[]>();

  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-6 py-8" aria-label="Journalist profile">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: "Journalists" },
            { label: journalist.name ?? "Profile" },
          ]}
        />
        <section className="ui-card density-card">
          <div className="flex items-start gap-4">
            {journalist.avatar_url ? (
              <Image
                src={journalist.avatar_url}
                alt={journalist.name ?? "Journalist avatar"}
                width={84}
                height={84}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-sm uppercase tracking-[0.18em] text-white/70">
                JT
              </div>
            )}
            <div>
              <p className="kicker">Journalist profile</p>
              <h1 className="mt-1 text-3xl font-semibold">{journalist.name ?? "ClogTv Correspondent"}</h1>
              <p className="ui-muted mt-1 text-sm uppercase tracking-[0.14em]">
                {(journalist.role ?? "journalist").replace("_", " ")}
              </p>
            </div>
          </div>
        </section>
        <section className="ui-card density-card mt-6">
          <div className="mb-3 flex items-center justify-between border-b border-[color:var(--border)] pb-2">
            <h2 className="kicker">Recent reporting</h2>
            <Link href="/news" className="ui-muted text-xs uppercase tracking-[0.16em] hover:text-foreground">
              All news
            </Link>
          </div>
          <div className="space-y-2">
            {(stories ?? []).map((story) => (
              <Link key={story.id} href={`/news/${story.slug}`} className="block rounded-md px-2 py-2 hover:bg-white/5">
                <p className="font-medium">{story.title}</p>
                <p className="ui-muted text-xs">{formatDate(story.published_at)}</p>
              </Link>
            ))}
            {!stories?.length ? <p className="ui-muted text-sm">No published stories yet.</p> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
