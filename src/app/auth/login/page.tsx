import { Flame } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{
    redirectedFrom?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f7f4f4] px-6 py-14 text-stone-900">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
        aria-hidden
      >
        <Flame className="h-[min(420px,75vw)] w-[min(420px,75vw)] text-stone-500" strokeWidth={0.75} />
      </div>

      <main
        id="main-content"
        aria-label="Sign in"
        className="relative z-10 w-full max-w-md rounded-2xl border border-red-200/80 bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-red-600/90">CLOG Access</p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-3xl">
          Sign in to editorial operations
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Access newsroom, live control, and admin based on your assigned role.
        </p>
        <div className="mt-6">
          <LoginForm redirectedFrom={params.redirectedFrom} variant="light" />
        </div>
      </main>
    </div>
  );
}
