import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type UserRole = "journalist" | "editor" | "admin";

const roleAccess: Record<string, UserRole[]> = {
  "/newsroom": ["journalist", "editor", "admin"],
  "/live": ["editor", "admin"],
  "/admin": ["admin"],
};

function getRequiredRoles(pathname: string): UserRole[] | null {
  if (pathname.startsWith("/admin")) return roleAccess["/admin"];
  if (pathname.startsWith("/live")) return roleAccess["/live"];
  if (pathname.startsWith("/newsroom")) return roleAccess["/newsroom"];
  return null;
}

export async function middleware(request: NextRequest) {
  const requiredRoles = getRequiredRoles(request.nextUrl.pathname);
  if (!requiredRoles) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "journalist") as UserRole;
  if (!requiredRoles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/newsroom/:path*", "/live/:path*", "/admin/:path*"],
};
