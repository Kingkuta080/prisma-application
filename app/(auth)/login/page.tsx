import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const config = getSchoolConfig();
  const params = await searchParams;
  const showVerified = params.verified === "1";
  const showRegistered = params.registered === "1";

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="grid lg:grid-cols-[480px_1fr]">
          {/* ── Left panel (brand) ──────────────────────────────────── */}
          <div
            className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex"
            style={{
              background:
                "linear-gradient(160deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 75%, #0a0630) 100%)",
            }}
          >
            {/* Dot texture */}
            <div className="dot-grid absolute inset-0 opacity-100" />

            {/* Accent glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, var(--brand-accent), transparent 70%)",
              }}
            />

            {/* School branding */}
            <div className="relative flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <GraduationCap className="size-5 text-white/90" />
              </span>
              <span className="font-heading text-[16px] font-semibold text-white">
                {config.schoolName}
              </span>
            </div>

            {/* Main message */}
            <div className="relative space-y-4">
              <div className="h-px w-12 bg-white/30" />
              <h1 className="font-heading text-3xl font-semibold leading-tight text-white">
                Welcome back to your family enrollment dashboard.
              </h1>
              <p className="text-sm leading-relaxed text-white/65">
                Sign in to manage applications, track admission status, and
                download official documents.
              </p>
            </div>

            {/* Bottom credential note */}
            <div className="relative">
              <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                <p className="text-xs text-white/55">
                  Parent Portal · Secure & encrypted access
                </p>
              </div>
            </div>
          </div>

          {/* ── Right panel (form) ─────────────────────────────────── */}
          <div className="flex items-center justify-center p-8 sm:p-12">
            <div className="w-full max-w-sm">
              {/* Mobile logo */}
              <div className="mb-6 flex items-center gap-2 lg:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="size-4 text-primary" />
                </span>
                <span className="font-heading text-[15px] font-semibold text-foreground">
                  {config.schoolName}
                </span>
              </div>

              <div className="mb-8">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  Sign in
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Use your email or Google account to continue.
                </p>
              </div>

              {showVerified && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Email verified — you can sign in now.
                </div>
              )}
              {showRegistered && (
                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  Account created. Please verify your email first, then sign in.
                </div>
              )}

              <Suspense
                fallback={
                  <div className="text-sm text-muted-foreground">Loading…</div>
                }
              >
                <LoginForm />
              </Suspense>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Register now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
