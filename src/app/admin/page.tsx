import dynamic from "next/dynamic";
import { CategoryManager } from "@/components/admin/category-manager";
import { MediaLibrary } from "@/components/admin/media-library";
import { RouteShell } from "@/components/editorial/route-shell";
import { UserManager } from "@/components/admin/user-manager";
import { requireRole } from "@/lib/auth/server-guard";

const OverviewCharts = dynamic(
  () => import("@/components/admin/overview-charts").then((mod) => mod.OverviewCharts),
  { loading: () => <section className="ui-card density-card h-64 animate-pulse" /> },
);

export default async function AdminPage() {
  const auth = await requireRole(["admin"]);

  return (
    <RouteShell title="Admin Control" role={auth.role} fullName={auth.fullName}>
      <section className="mb-6 density-grid grid md:grid-cols-5">
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Overview</p>
          <p className="mt-2 text-2xl font-semibold">32,480</p>
          <p className="ui-muted text-xs">Weekly views</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Articles</p>
          <p className="mt-2 text-2xl font-semibold">164</p>
          <p className="ui-muted text-xs">Published this month</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Media library</p>
          <p className="mt-2 text-2xl font-semibold">2,308</p>
          <p className="ui-muted text-xs">Assets in storage</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Comments</p>
          <p className="mt-2 text-2xl font-semibold">918</p>
          <p className="ui-muted text-xs">Awaiting moderation</p>
        </article>
        <article className="ui-card density-card md:col-span-1">
          <p className="ui-muted text-xs uppercase tracking-[0.2em]">Notifications</p>
          <p className="mt-2 text-2xl font-semibold">21</p>
          <p className="ui-muted text-xs">Breaking alerts sent</p>
        </article>
      </section>

      <OverviewCharts />

      <section className="density-grid grid lg:grid-cols-2">
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Role Management</h2>
          <p className="ui-muted mt-2 text-sm">
            Configure reporter, editor, producer, and admin assignments for global teams.
          </p>
          <button className="btn-secondary mt-5">
            Open user permissions
          </button>
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
        <UserManager />
      </section>

      <section className="mt-6">
        <MediaLibrary />
      </section>
    </RouteShell>
  );
}
