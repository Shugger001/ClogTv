import { NextResponse } from "next/server";
import { summarizeWithProvider } from "@/lib/ai/provider";
import { getOrCreateRequestId } from "@/lib/observability/provider-logger";

export async function POST(request: Request) {
  const requestId = getOrCreateRequestId(request);
  const { content } = (await request.json()) as { content?: string };
  if (!content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400, headers: { "x-request-id": requestId } });
  }
  const summary = await summarizeWithProvider(content, requestId);
  return NextResponse.json({ summary }, { headers: { "x-request-id": requestId } });
}
