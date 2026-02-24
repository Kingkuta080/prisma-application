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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <SchoolLogo
            schoolLogo={config.schoolLogo}
            size={48}
            wrapperClassName="flex justify-center"
          />
          <span className="text-sm font-medium text-muted-foreground">
            {config.schoolName}
          </span>
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Use your email or Google to continue.
          </p>
        </div>
        {showVerified && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-700 dark:text-green-400">
            Email verified. You can sign in now.
          </p>
        )}
        {showRegistered && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-700 dark:text-green-400">
            Account created. Please verify your email, then sign in.
          </p>
        )}
        <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="text-primary underline">
            Register
          </Link>
        </p>
        <p className="text-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
