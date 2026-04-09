import dynamic from "next/dynamic";
import Link from "next/link";
import { CategoryManager } from "@/components/admin/category-manager";
import { MediaLibrary } from "@/components/admin/media-library";
import { RouteShell } from "@/components/editorial/route-shell";
import { UserManager } from "@/components/admin/user-manager";
import { getAdminOverviewStats } from "@/lib/admin/overview-stats";
import { requireRole } from "@/lib/auth/server-guard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OverviewCharts = dynamic(
  () => import("@/components/admin/overview-charts").then((mod) => mod.OverviewCharts),
  { loading: () => <section className="ui-card density-card h-64 animate-pulse" /> },
);

function formatInt(n: number) {
  return n.toLocaleString("en-US");
}

export default async function AdminPage() {
  const auth = await requireRole(["admin"]);
  const supabase = await createSupabaseServerClient();
  const stats = supabase ? await getAdminOverviewStats(supabase) : null;

  return (
    <RouteShell title="Admin Control" role={auth.role} fullName={auth.fullName}>
      <details className="mb-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm open:border-red-500/30">
        <summary className="cursor-pointer font-medium text-foreground outline-none marker:text-red-400">
          Who can do what here?
        </summary>
        <ul className="ui-muted mt-3 list-inside list-disc space-y-1.5 text-xs leading-relaxed">
          <li>
            <strong className="text-foreground/90">Admin</strong> — full access to categories, users, media, and
            overview tools on this page.
          </li>
          <li>
            <strong className="text-foreground/90">Editor</strong> — newsroom and publishing workflows; not this admin
            console unless promoted.
          </li>
          <li>
            <strong className="text-foreground/90">Journalist</strong> — story tools in the newsroom; no admin route
            access.
          </li>
        </ul>
        <p className="ui-muted mt-2 text-[11px]">
          Roles are stored on your user profile in the database. Contact a lead editor if you need a different role.
        </p>
      </details>

      <section className="mb-6 density-grid grid md:grid-cols-5">
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Overview</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats ? formatInt(stats.totalViews) : "—"}
          </p>
          <p className="ui-muted text-xs">Total views (published)</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Articles</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats ? formatInt(stats.publishedArticles) : "—"}
          </p>
          <p className="ui-muted text-xs">Published articles</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Media library</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats ? formatInt(stats.mediaAssets) : "—"}
          </p>
          <p className="ui-muted text-xs">Assets in storage</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Comments</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats ? formatInt(stats.totalComments) : "—"}
          </p>
          <p className="ui-muted text-xs">Total comments</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Notifications</p>
          <p className="mt-2 text-2xl font-semibold">
            {stats ? formatInt(stats.notificationsCount) : "—"}
          </p>
          <p className="ui-muted text-xs">Rows in notifications</p>
        </article>
      </section>

      <OverviewCharts />

      <section className="density-grid grid lg:grid-cols-2">
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Role Management</h2>
          <p className="ui-muted mt-2 text-sm">
            Configure reporter, editor, producer, and admin assignments for global teams.
          </p>
          <Link href="#user-management" className="btn-secondary mt-5 inline-flex">
            Open user permissions
          </Link>
        </article>
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">System Operations</h2>
          <ul className="ui-muted mt-3 space-y-2 text-sm">
            <li>- Articles manager</li>
            <li>- Category manager</li>
            <li>- Media library</li>
            <li>- User management</li>
            <li>- Draft to Review to Publish pipeline</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 density-grid grid lg:grid-cols-2">
        <CategoryManager />
        <div id="user-management" className="scroll-mt-28">
          <UserManager />
        </div>
      </section>

      <section id="media-library" className="mt-6 scroll-mt-24">
        <MediaLibrary />
      </section>
    </RouteShell>
  );
}
