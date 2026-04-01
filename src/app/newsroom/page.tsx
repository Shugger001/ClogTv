import { RouteShell } from "@/components/editorial/route-shell";
import { ArticlesManager } from "@/components/news/articles-manager";
import { ScheduledPublishButton } from "@/components/scheduled-publish-button";
import { requireRole } from "@/lib/auth/server-guard";

export default async function NewsroomPage() {
  const auth = await requireRole(["journalist", "editor", "admin"]);
  const canPublish = auth.role === "editor" || auth.role === "admin";

  return (
    <RouteShell title="Newsroom" role={auth.role} fullName={auth.fullName}>
      <section className="density-grid grid lg:grid-cols-2">
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Editorial Queue</h2>
          <p className="ui-muted mt-2 text-sm">
            Journalists draft stories, editors review and approve, admins escalate breaking
            content to live channels.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-secondary">
              Create Draft
            </button>
            <button disabled={!canPublish} className="btn-primary">
              Publish Breaking
            </button>
            {canPublish ? <ScheduledPublishButton /> : null}
          </div>
        </article>
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Permissions for your role</h2>
          <ul className="ui-muted mt-3 space-y-2 text-sm">
            <li>- Draft and update assigned stories</li>
            <li>- Submit pieces for legal/editorial review</li>
            <li>- Breaking publish: {canPublish ? "Allowed" : "Not allowed"}</li>
          </ul>
        </article>
      </section>
      <div className="mt-6">
        <ArticlesManager />
      </div>
    </RouteShell>
  );
}
