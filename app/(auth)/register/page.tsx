import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { prisma } from "@/lib/prisma";
import { SchoolLogo } from "@/components/school-logo";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { RegisterForm } from "./register-form";
import { BookOpen, Users, Award } from "lucide-react";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const config = getSchoolConfig();

  const openSession = await prisma.applicationSession.findFirst({
    where: {
      openAt: { lte: new Date() },
      closeAt: { gte: new Date() },
    },
    orderBy: { year: "desc" },
  });

  const steps = [
    {
      num: "01",
      title: "Create your account",
      desc: "Register with your email and a secure password.",
    },
    {
      num: "02",
      title: "Complete your profile",
      desc: "Provide guardian and contact information.",
    },
    {
      num: "03",
      title: "Submit application",
      desc: "Fill in your ward's details and pay the application fee.",
    },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left panel (light minimal, matches login) ────────────────────── */}
      <div className="relative hidden w-[46%] shrink-0 flex-col overflow-hidden border-r border-border bg-white lg:flex">
        <div className="absolute inset-0 bg-primary/[0.03]" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative flex flex-1 flex-col p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
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
              <p className="text-[10px] font-medium text-muted-foreground">Parent Portal</p>
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-auto space-y-8">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                Getting Started
              </span>
              <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-foreground">
                Start your<br />enrollment<br />journey today.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Create an account to begin managing applications for your ward.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map(({ num, title, desc }) => (
                <div key={num} className="flex items-start gap-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {num}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
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
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                Create account
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Register to access the parent portal.
              </p>
            </div>

            <RegisterForm />
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
