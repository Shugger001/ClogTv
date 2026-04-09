import { NextResponse } from "next/server";
import { syncNewsletterSubscriber } from "@/lib/newsletter/provider";
import { getOrCreateRequestId } from "@/lib/observability/provider-logger";
import { captureServerException } from "@/lib/observability/sentry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const requestId = getOrCreateRequestId(request);
    const { email, fullName } = (await request.json()) as { email?: string; fullName?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400, headers: { "x-request-id": requestId } },
      );
    }

    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503, headers: { "x-request-id": requestId } },
      );
    }

    const { error } = await supabase.from("newsletter_subscribers").upsert(
      {
        email: email.trim().toLowerCase(),
        full_name: fullName?.trim() || null,
        is_active: true,
      },
      { onConflict: "email" },
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: { "x-request-id": requestId } });
    }

    await syncNewsletterSubscriber(email.trim().toLowerCase(), fullName?.trim() || undefined, requestId);

    return NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    const requestId = getOrCreateRequestId(request);
    captureServerException(error, { route: "/api/newsletter/subscribe", requestId });
    return NextResponse.json(
      { error: "Unable to subscribe right now." },
      { status: 500, headers: { "x-request-id": requestId } },
    );
  }
}
