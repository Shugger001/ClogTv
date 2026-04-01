"use client";

import { useState } from "react";

export function ScheduledPublishButton() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function runPublish() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/schedule/publish", { method: "POST" });
      const payload = (await response.json()) as { publishedCount?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Failed to publish");
      setStatus(`Published ${payload.publishedCount ?? 0} scheduled article(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to run publisher.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="btn-primary" disabled={loading} onClick={runPublish}>
        {loading ? "Running..." : "Run Scheduled Publish"}
      </button>
      <span className="ui-muted text-xs">{status}</span>
    </div>
  );
}
