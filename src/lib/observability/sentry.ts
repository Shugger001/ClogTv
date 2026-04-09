import * as Sentry from "@sentry/nextjs";

export function captureServerException(
  error: unknown,
  context: {
    route: string;
    requestId?: string;
    extra?: Record<string, unknown>;
  },
) {
  if (!process.env.SENTRY_DSN) return;
  Sentry.withScope((scope) => {
    scope.setTag("route", context.route);
    if (context.requestId) scope.setTag("request_id", context.requestId);
    if (context.extra) scope.setContext("extra", context.extra);
    Sentry.captureException(error);
  });
}
