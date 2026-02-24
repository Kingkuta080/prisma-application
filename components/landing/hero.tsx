import Link from "next/link";
import { ArrowRight, CalendarCheck2, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type LandingHeroProps = {
  hasSession: boolean;
  yearLabel?: string;
  schoolName: string;
  schoolDescription: string;
};

export function LandingHero({
  hasSession,
  yearLabel,
  schoolName,
  schoolDescription,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pb-32 pt-28"
      style={{
        background: "linear-gradient(160deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 80%, #0a0630) 100%)",
      }}
    >
      {/* Dot grid texture */}
      <div className="dot-grid absolute inset-0 opacity-100" />

      {/* Radial accent glow */}
      <div
        className="pointer-events-none absolute -right-32 top-0 h-[600px] w-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-96 w-96 rounded-full opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5">
        <div className="grid gap-14 lg:grid-cols-[1fr_420px] lg:items-center">
          {/* ── Left: Text ─────────────────────────────────────────────── */}
          <div>
            {/* Enrollment badge */}
            {hasSession && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Enrollment {yearLabel ? `${yearLabel}` : ""} is now open
              </div>
            )}

            {/* School name display heading */}
            <h1 className="font-heading text-5xl font-semibold italic leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[68px]">
              {schoolName}
            </h1>

            {/* Divider line */}
            <div className="my-6 h-px w-16 bg-white/30" />

            {/* Description */}
            <p className="max-w-lg text-lg leading-relaxed text-white/80">
              {schoolDescription}
            </p>
            <p className="mt-3 max-w-md text-base text-white/60">
              Apply online in minutes. Pay securely, track your application
              status, and download admission documents—all in one place.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white font-semibold text-primary shadow-xl hover:bg-white/95"
              >
                <Link href="/register">
                  Start application
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>
          </div>

          {/* ── Right: Floating cards ──────────────────────────────────── */}
          <div className="space-y-3">
            {/* Status overview card */}
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-md">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/50">
                Enrollment at a glance
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="font-heading text-3xl font-semibold text-white">500+</p>
                  <p className="mt-0.5 text-xs text-white/60">Families enrolled</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="font-heading text-3xl font-semibold text-white">3</p>
                  <p className="mt-0.5 text-xs text-white/60">Steps to apply</p>
                </div>
              </div>
            </div>

            {/* Process mini-steps */}
            <div className="space-y-2">
              {[
                { icon: FileText, step: "1.", text: "Create account & submit application" },
                { icon: Shield, step: "2.", text: "Complete secure payment online" },
                { icon: CalendarCheck2, step: "3.", text: "Receive admission decision" },
              ].map(({ icon: Icon, step, text }) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white/80">
                    {step}
                  </span>
                  <p className="text-sm text-white/80">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 72"
          className="w-full"
          preserveAspectRatio="none"
          style={{ height: "72px", fill: "var(--background)" }}
        >
          <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" />
        </svg>
      </div>
    </section>
  );
}
