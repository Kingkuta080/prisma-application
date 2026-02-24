import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { getSchoolConfig } from "@/lib/school-config";
import { RegisterForm } from "./register-form";

const BENEFITS = [
  "Submit applications for all your children from one account",
  "Track application status and payment in real-time",
  "Download receipts and admission letters as PDFs",
  "Receive notifications when your status changes",
];

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  const config = getSchoolConfig();

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
            <div className="dot-grid absolute inset-0 opacity-100" />
            <div
              className="pointer-events-none absolute -left-12 bottom-0 h-72 w-72 rounded-full opacity-15"
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
            <div className="relative space-y-5">
              <div className="h-px w-12 bg-white/30" />
              <h1 className="font-heading text-3xl font-semibold leading-tight text-white">
                Create your enrollment account in under a minute.
              </h1>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <span className="text-sm text-white/75">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom note */}
            <div className="relative">
              <div className="rounded-xl border border-white/15 bg-white/8 px-4 py-3">
                <p className="text-xs text-white/55">
                  {config.schoolDescription}
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
                  Create account
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Register with your email to get started.
                </p>
              </div>

              <RegisterForm />

              <p className="mt-6 text-center text-sm text-muted-foreground">
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
      </div>
    </div>
  );
}
