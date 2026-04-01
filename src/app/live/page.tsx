import { RouteShell } from "@/components/editorial/route-shell";
import { requireRole } from "@/lib/auth/server-guard";

export default async function LivePage() {
  const auth = await requireRole(["editor", "admin"]);
  const canControlBroadcast = auth.role === "admin";

  return (
    <RouteShell title="Live Control" role={auth.role} fullName={auth.fullName}>
      <section className="density-grid grid lg:grid-cols-2">
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Broadcast Control Room</h2>
          <p className="ui-muted mt-2 text-sm">
            Coordinate lower thirds, emergency overlays, and regional feed switching.
          </p>
          <div className="mt-5 flex gap-3">
            <button disabled={!canControlBroadcast} className="btn-primary">
              Go Live
            </button>
            <button className="btn-secondary">
              Preview Feed
            </button>
          </div>
        </article>
        <article className="ui-card density-card">
          <h2 className="text-lg font-semibold">Role access</h2>
          <ul className="ui-muted mt-3 space-y-2 text-sm">
            <li>- Access to live route: Allowed</li>
            <li>- Direct broadcast control: {canControlBroadcast ? "Allowed" : "Read-only"}</li>
            <li>- Emergency interruption tools: {canControlBroadcast ? "Allowed" : "Read-only"}</li>
          </ul>
        </article>
      </section>
    </RouteShell>
  );
}
