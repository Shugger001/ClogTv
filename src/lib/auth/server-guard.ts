import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasRoleAccess, UserRole } from "./roles";

export interface AuthContext {
  userId: string;
  email: string | undefined;
  fullName: string | null;
  role: UserRole;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthContext> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "journalist") as UserRole;
  if (!hasRoleAccess(role, allowedRoles)) {
    redirect("/unauthorized");
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: profile?.name ?? null,
    role,
  };
}
