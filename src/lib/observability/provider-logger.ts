type LogLevel = "info" | "warn" | "error";

interface ProviderLogMeta {
  request_id?: string;
  provider: string;
  operation: string;
  status: "success" | "fallback" | "error" | "timeout";
  duration_ms?: number;
  http_status?: number;
  error_name?: string;
  error_message?: string;
}

function sanitizeMessage(message?: string) {
  if (!message) return undefined;
  return message.replace(/(api[_-]?key|authorization|bearer)\s*[:=]\s*[^,\s]+/gi, "[redacted]").slice(0, 220);
}

export function logProviderEvent(level: LogLevel, meta: ProviderLogMeta) {
  const payload = {
    ts: new Date().toISOString(),
    component: "provider_call",
    ...meta,
    error_message: sanitizeMessage(meta.error_message),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export function getOrCreateRequestId(request?: Request) {
  const headerId = request?.headers.get("x-request-id")?.trim();
  if (headerId) return headerId.slice(0, 100);
  return crypto.randomUUID();
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
