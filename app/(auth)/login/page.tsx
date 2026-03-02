import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { SchoolLogo } from "@/components/school-logo";
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
    <div className="grid min-h-screen w-full lg:grid-cols-[1fr_1fr]">
      {/* Left: full-height panel with subtle bg image + overlay, no primary gradient */}
      <div className="relative hidden min-h-screen overflow-hidden lg:block">
        {/* Optional background image with fallback to light neutral (see .login-panel-bg in globals.css) */}
        <div className="login-panel-bg absolute inset-0" />
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px]" />
        <div className="relative flex min-h-screen flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <SchoolLogo
              schoolLogo={config.schoolLogo}
              wrapperClassName="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/90 shadow-sm ring-1 ring-primary/20"
              fallbackIconClassName="size-5 text-primary"
              size={40}
            />
            <span className="font-heading text-[16px] font-semibold text-foreground">
              {config.schoolName}
            </span>
          </div>

          <div className="space-y-4">
            <div className="h-px w-12 bg-foreground/20" />
            <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground">
              Welcome back to your family enrollment dashboard.
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to manage applications, track admission status, and
              download official documents.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Application guidelines
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                Submit one application per child for the selected enrollment session.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                Ensure all personal details are accurate before submitting — changes may require re-application.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                Payment of the application fee is required to complete and confirm your submission.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                Once paid, download your receipt from your dashboard. Admission letters will be available when decisions are released.
              </li>
            </ul>
          </div>

          <div>
            <div className="rounded-xl border border-border bg-card/80 px-4 py-3 shadow-sm">
              <p className="text-xs text-muted-foreground">
                Parent Portal · Secure & encrypted access
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: white/light form panel, edge-to-edge */}
      <div className="flex min-h-screen items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <SchoolLogo
              schoolLogo={config.schoolLogo}
              wrapperClassName="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/20"
              fallbackIconClassName="size-4 text-primary"
              size={32}
            />
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-muted-foreground">No account?</span>
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Register now
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
