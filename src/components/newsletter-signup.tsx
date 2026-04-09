"use client";

import { FormEvent, useState } from "react";

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  source?: string;
  className?: string;
  compact?: boolean;
}

export function NewsletterSignup({
  title = "Get top headlines in your inbox",
  description = "Daily briefings, breaking alerts, and editor picks.",
  source = "site",
  className = "",
  compact = false,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, source }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      setStatus("Subscribed to newsletter.");
      setEmail("");
      setFullName("");
    } catch {
      setStatus("Unable to subscribe right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={`ui-card density-card space-y-3 ${className}`.trim()}>
      <p className="kicker">Newsletter</p>
      <h3 className={`headline-compact font-semibold ${compact ? "text-base" : "text-lg"}`}>{title}</h3>
      <p className="ui-muted text-sm">{description}</p>
      <div className={`grid gap-2 ${compact ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Full name (optional)"
          className="ui-surface rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          required
          className="ui-surface rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="ui-muted text-xs">{status}</p>
        <button className="btn-primary" disabled={loading}>
          {loading ? "Joining..." : "Subscribe"}
        </button>
      </div>
    </form>
  );
}
