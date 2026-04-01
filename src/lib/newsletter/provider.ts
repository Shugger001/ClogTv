import { createHash } from "crypto";
import { fetchWithTimeout, logProviderEvent } from "@/lib/observability/provider-logger";

type NewsletterProvider = "none" | "resend" | "mailchimp";
const NEWSLETTER_TIMEOUT_MS = Number(process.env.NEWSLETTER_PROVIDER_TIMEOUT_MS ?? 10000);

function getProvider(): NewsletterProvider {
  const provider = (process.env.NEWSLETTER_PROVIDER ?? "none").toLowerCase();
  if (provider === "resend" || provider === "mailchimp") return provider;
  return "none";
}

async function upsertMailchimpContact(email: string, fullName?: string, requestId?: string) {
  const startedAt = Date.now();
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    logProviderEvent("warn", {
      request_id: requestId,
      provider: "mailchimp",
      operation: "newsletter_sync",
      status: "fallback",
      duration_ms: Date.now() - startedAt,
      error_name: "MissingCredentials",
    });
    return;
  }

  const dc = apiKey.split("-")[1];
  if (!dc) {
    logProviderEvent("warn", {
      request_id: requestId,
      provider: "mailchimp",
      operation: "newsletter_sync",
      status: "fallback",
      duration_ms: Date.now() - startedAt,
      error_name: "InvalidApiKeyFormat",
    });
    return;
  }

  const memberHash = createHash("md5").update(email.toLowerCase()).digest("hex");
  const baseUrl = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members/${memberHash}`;
  const [firstName, ...rest] = (fullName ?? "").trim().split(" ");
  const lastName = rest.join(" ");

  try {
    const response = await fetchWithTimeout(
      baseUrl,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString("base64")}`,
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: "subscribed",
          status: "subscribed",
          merge_fields: {
            FNAME: firstName || "",
            LNAME: lastName || "",
          },
        }),
      },
      NEWSLETTER_TIMEOUT_MS,
    );
    if (!response.ok) {
      logProviderEvent("error", {
        request_id: requestId,
        provider: "mailchimp",
        operation: "newsletter_sync",
        status: "error",
        duration_ms: Date.now() - startedAt,
        http_status: response.status,
      });
      return;
    }
    logProviderEvent("info", {
      request_id: requestId,
      provider: "mailchimp",
      operation: "newsletter_sync",
      status: "success",
      duration_ms: Date.now() - startedAt,
      http_status: response.status,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    logProviderEvent("error", {
      request_id: requestId,
      provider: "mailchimp",
      operation: "newsletter_sync",
      status: timedOut ? "timeout" : "error",
      duration_ms: Date.now() - startedAt,
      error_name: error instanceof Error ? error.name : "UnknownError",
      error_message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function addResendAudienceContact(email: string, fullName?: string, requestId?: string) {
  const startedAt = Date.now();
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) {
    logProviderEvent("warn", {
      request_id: requestId,
      provider: "resend",
      operation: "newsletter_sync",
      status: "fallback",
      duration_ms: Date.now() - startedAt,
      error_name: "MissingCredentials",
    });
    return;
  }

  const [firstName, ...rest] = (fullName ?? "").trim().split(" ");
  const lastName = rest.join(" ");

  try {
    const response = await fetchWithTimeout(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          unsubscribed: false,
        }),
      },
      NEWSLETTER_TIMEOUT_MS,
    );
    if (!response.ok) {
      logProviderEvent("error", {
        request_id: requestId,
        provider: "resend",
        operation: "newsletter_sync",
        status: "error",
        duration_ms: Date.now() - startedAt,
        http_status: response.status,
      });
      return;
    }
    logProviderEvent("info", {
      request_id: requestId,
      provider: "resend",
      operation: "newsletter_sync",
      status: "success",
      duration_ms: Date.now() - startedAt,
      http_status: response.status,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    logProviderEvent("error", {
      request_id: requestId,
      provider: "resend",
      operation: "newsletter_sync",
      status: timedOut ? "timeout" : "error",
      duration_ms: Date.now() - startedAt,
      error_name: error instanceof Error ? error.name : "UnknownError",
      error_message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function syncNewsletterSubscriber(email: string, fullName?: string, requestId?: string) {
  const provider = getProvider();
  if (provider === "mailchimp") {
    await upsertMailchimpContact(email, fullName, requestId);
    return;
  }
  if (provider === "resend") {
    await addResendAudienceContact(email, fullName, requestId);
    return;
  }
  logProviderEvent("info", {
    request_id: requestId,
    provider: "none",
    operation: "newsletter_sync",
    status: "fallback",
  });
}
