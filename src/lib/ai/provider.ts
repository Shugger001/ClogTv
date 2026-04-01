import { generateHeadlineSuggestions, generateSummary } from "./news-assistant";
import { fetchWithTimeout, logProviderEvent } from "@/lib/observability/provider-logger";

type AiProvider = "fallback" | "openai" | "anthropic";
const AI_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS ?? 12000);

function getAiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER ?? "fallback").toLowerCase();
  if (provider === "openai" || provider === "anthropic") return provider;
  return "fallback";
}

export async function suggestHeadlinesWithProvider(
  title: string,
  category?: string,
  requestId?: string,
) {
  const fallback = generateHeadlineSuggestions(title, category);
  const provider = getAiProvider();
  const startedAt = Date.now();

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "Generate exactly 4 concise, high-impact news headlines as a JSON array of strings. No prose.",
            },
            {
              role: "user",
              content: `Category: ${category ?? "General"}\nTitle: ${title}`,
            },
          ],
        }),
      }, AI_TIMEOUT_MS);
      if (!response.ok) {
        logProviderEvent("warn", {
          request_id: requestId,
          provider: "openai",
          operation: "headline_suggestions",
          status: "fallback",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return fallback;
      }
      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(text) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        logProviderEvent("info", {
          request_id: requestId,
          provider: "openai",
          operation: "headline_suggestions",
          status: "success",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return parsed.filter(Boolean).slice(0, 4);
      }
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      logProviderEvent("error", {
        request_id: requestId,
        provider: "openai",
        operation: "headline_suggestions",
        status: timedOut ? "timeout" : "error",
        duration_ms: Date.now() - startedAt,
        error_name: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
          max_tokens: 250,
          temperature: 0.6,
          system: "Return only a JSON array containing exactly 4 news headline strings.",
          messages: [
            {
              role: "user",
              content: `Category: ${category ?? "General"}\nTitle: ${title}`,
            },
          ],
        }),
      }, AI_TIMEOUT_MS);
      if (!response.ok) {
        logProviderEvent("warn", {
          request_id: requestId,
          provider: "anthropic",
          operation: "headline_suggestions",
          status: "fallback",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return fallback;
      }
      const payload = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      const text = payload.content?.find((item) => item.type === "text")?.text ?? "";
      const parsed = JSON.parse(text) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        logProviderEvent("info", {
          request_id: requestId,
          provider: "anthropic",
          operation: "headline_suggestions",
          status: "success",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return parsed.filter(Boolean).slice(0, 4);
      }
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      logProviderEvent("error", {
        request_id: requestId,
        provider: "anthropic",
        operation: "headline_suggestions",
        status: timedOut ? "timeout" : "error",
        duration_ms: Date.now() - startedAt,
        error_name: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  if (provider !== "fallback") {
    logProviderEvent("warn", {
      request_id: requestId,
      provider,
      operation: "headline_suggestions",
      status: "fallback",
      duration_ms: Date.now() - startedAt,
      error_name: "MissingCredentials",
    });
  }
  return fallback;
}

export async function summarizeWithProvider(content: string, requestId?: string) {
  const fallback = generateSummary(content);
  const provider = getAiProvider();
  const startedAt = Date.now();

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: "Write a neutral 1-2 sentence newsroom summary under 45 words.",
            },
            {
              role: "user",
              content,
            },
          ],
        }),
      }, AI_TIMEOUT_MS);
      if (!response.ok) {
        logProviderEvent("warn", {
          request_id: requestId,
          provider: "openai",
          operation: "article_summary",
          status: "fallback",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return fallback;
      }
      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = payload.choices?.[0]?.message?.content?.trim();
      if (text) {
        logProviderEvent("info", {
          request_id: requestId,
          provider: "openai",
          operation: "article_summary",
          status: "success",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return text;
      }
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      logProviderEvent("error", {
        request_id: requestId,
        provider: "openai",
        operation: "article_summary",
        status: timedOut ? "timeout" : "error",
        duration_ms: Date.now() - startedAt,
        error_name: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    try {
      const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
          max_tokens: 220,
          temperature: 0.3,
          system: "Write one concise newsroom summary paragraph under 45 words.",
          messages: [{ role: "user", content }],
        }),
      }, AI_TIMEOUT_MS);
      if (!response.ok) {
        logProviderEvent("warn", {
          request_id: requestId,
          provider: "anthropic",
          operation: "article_summary",
          status: "fallback",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return fallback;
      }
      const payload = (await response.json()) as {
        content?: Array<{ type?: string; text?: string }>;
      };
      const text = payload.content?.find((item) => item.type === "text")?.text?.trim();
      if (text) {
        logProviderEvent("info", {
          request_id: requestId,
          provider: "anthropic",
          operation: "article_summary",
          status: "success",
          duration_ms: Date.now() - startedAt,
          http_status: response.status,
        });
        return text;
      }
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";
      logProviderEvent("error", {
        request_id: requestId,
        provider: "anthropic",
        operation: "article_summary",
        status: timedOut ? "timeout" : "error",
        duration_ms: Date.now() - startedAt,
        error_name: error instanceof Error ? error.name : "UnknownError",
        error_message: error instanceof Error ? error.message : String(error),
      });
      return fallback;
    }
  }

  if (provider !== "fallback") {
    logProviderEvent("warn", {
      request_id: requestId,
      provider,
      operation: "article_summary",
      status: "fallback",
      duration_ms: Date.now() - startedAt,
      error_name: "MissingCredentials",
    });
  }
  return fallback;
}
