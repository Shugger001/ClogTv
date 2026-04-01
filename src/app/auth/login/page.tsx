import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{
    redirectedFrom?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-foreground">
      <section className="glass-panel w-full max-w-md rounded-3xl p-7">
        <p className="text-xs uppercase tracking-[0.3em] text-red-300">CLOG Access</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">Sign in to editorial operations</h1>
        <p className="ui-muted mt-3 text-sm leading-6">
          Access newsroom, live control, and admin based on your assigned role.
        </p>
        <div className="mt-6">
          <LoginForm redirectedFrom={params.redirectedFrom} />
        </div>
      </section>
    </div>
  );
}
