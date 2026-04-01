import { NextResponse } from "next/server";
import { suggestHeadlinesWithProvider } from "@/lib/ai/provider";
import { getOrCreateRequestId } from "@/lib/observability/provider-logger";

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const { title, category } = (await request.json()) as { title?: string; category?: string };
  if (!title?.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400, headers: { "x-request-id": requestId } });
  }
  const suggestions = await suggestHeadlinesWithProvider(title, category, requestId);
  return NextResponse.json({ suggestions }, { headers: { "x-request-id": requestId } });
}
