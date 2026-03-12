import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { prisma } from "@/lib/prisma";
import { SchoolLogo } from "@/components/school-logo";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { LoginForm } from "./login-form";
import { ShieldCheck, Clock, FileCheck } from "lucide-react";

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

  const openSession = await prisma.applicationSession.findFirst({
    where: {
      openAt: { lte: new Date() },
      closeAt: { gte: new Date() },
    },
    orderBy: { year: "desc" },
  });

  const features = [
    {
      icon: FileCheck,
      title: "Submit applications",
      desc: "Apply for enrollment sessions with a simple, guided form.",
    },
    {
      icon: Clock,
      title: "Track in real time",
      desc: "Monitor your ward's application status from submission to decision.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & private",
      desc: "Your data is encrypted and accessible only to authorized parties.",
    },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div className="relative hidden w-[46%] shrink-0 flex-col overflow-hidden border-r border-border bg-white lg:flex">
        {/* Subtle brand tint + dot pattern */}
        <div className="pointer-events-none absolute inset-0 bg-primary/3" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex flex-1 flex-col p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/15">
              <SchoolLogo
                schoolLogo={config.schoolLogo}
                wrapperClassName="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl"
                fallbackIconClassName="size-5 text-primary"
                size={40}
              />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-foreground">
                {config.schoolName}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">
                Parent Portal
              </p>
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-auto space-y-8">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                Admission Management
              </span>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground">
                Manage your<br />ward&apos;s enrollment<br />in one place.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Sign in to submit applications, track admission status, and download
                official documents.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Deadline countdown */}
            {openSession && (
              <div className="rounded-xl border border-border bg-muted px-4 py-4">
                <DeadlineCountdown
                  closeAt={openSession.closeAt.toISOString()}
                  variant="loginPanel"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-[#f9fafb] px-4 py-8 sm:p-10">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <SchoolLogo
              schoolLogo={config.schoolLogo}
              wrapperClassName="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-primary/20"
              fallbackIconClassName="size-4 text-primary"
              size={32}
            />
            <span className="text-[14px] font-semibold text-foreground">
              {config.schoolName}
            </span>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Sign in
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Access your parent dashboard below.
              </p>
            </div>

            {showVerified && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span className="mt-0.5 text-emerald-500">✓</span>
                Email verified — you can sign in now.
              </div>
            )}
            {showRegistered && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                <span className="mt-0.5 text-blue-500">✓</span>
                Account created. Please verify your email first, then sign in.
              </div>
            )}

            <Suspense
              fallback={
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
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
  );
}
