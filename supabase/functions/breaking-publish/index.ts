import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: authHeader ?? "" } } },
    );

    const { articleId } = await req.json();
    if (!articleId) {
      return new Response(JSON.stringify({ error: "articleId is required." }), { status: 400 });
    }

    const { error } = await supabase
      .from("articles")
      .update({
        status: "published",
        priority: "breaking",
        is_breaking: true,
        published_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
