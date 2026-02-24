import Link from "next/link";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSchoolConfig } from "@/lib/school-config";
import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { GuidelinesSection } from "@/components/dashboard/guidelines-section";
import { ApplicationsTable } from "@/components/applications-table";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { LandingJourney } from "@/components/landing/journey";
import { LandingHighlights } from "@/components/landing/highlights";
import { LandingDatesBanner } from "@/components/landing/dates-banner";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import {
  FolderOpen,
  CreditCard,
  GraduationCap,
  ArrowRight,
  Clock,
} from "lucide-react";

export default async function HomePage() {
  const config = getSchoolConfig();

  let session: Session | null = null;
  let openSessions: Awaited<ReturnType<typeof prisma.applicationSession.findMany>> = [];

  try {
    [session, openSessions] = await Promise.all([
      auth(),
      prisma.applicationSession.findMany({
        where: {
          openAt: { lte: new Date() },
          closeAt: { gte: new Date() },
        },
        orderBy: { year: "desc" },
      }),
    ]);
  } catch {
    // On Vercel/hosting: auth or DB may fail (env, cold start, timeout). Show landing.
    session = null;
    openSessions = [];
  }

  const currentSession = openSessions[0] ?? null;

  /* ── Unauthenticated: Landing page ──────────────────────────────────── */
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background">
        <LandingNavbar
          schoolName={config.schoolName}
          schoolLogo={config.schoolLogo}
        />
        <LandingHero
          hasSession={!!currentSession}
          yearLabel={currentSession ? String(currentSession.year) : undefined}
          schoolName={config.schoolName}
          schoolDescription={config.schoolDescription}
        />
        <LandingJourney />
        <LandingHighlights />
        <LandingDatesBanner
          closeAt={currentSession?.closeAt.toISOString()}
          amount={currentSession ? Number(currentSession.amount) : undefined}
        />
        <LandingFaq />
        <LandingFooter
          schoolName={config.schoolName}
          schoolDescription={config.schoolDescription}
          schoolLogo={config.schoolLogo}
        />
      </div>
    );
  }

  /* ── Profile gate ────────────────────────────────────────────────────── */
  const hasName = !!session.user.name?.trim();
  const hasPhone = !!session.user.phone?.trim();
  if (!hasName || !hasPhone) redirect("/complete-profile");

  /* ── Fetch applications ──────────────────────────────────────────────── */
  const applicationsRaw = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { session: true, payments: true, admission: true },
    orderBy: { createdAt: "desc" },
  });

  const applications = applicationsRaw.map((app) => ({
    id: app.id,
    status: app.status,
    wardName: app.wardName,
    class: (app as unknown as { class: string }).class,
    session: { year: app.session.year, amount: Number(app.session.amount) },
    payments: app.payments.map((p) => ({ id: p.id, status: p.status })),
    admission: app.admission
      ? { id: app.admission.id, status: app.admission.status }
      : null,
  }));

  const pendingPayments = applications.filter((app) =>
    app.payments.some((p) => p.status === "PENDING")
  ).length;
  const admissionsOffered = applications.filter(
    (app) => app.admission?.status === "OFFERED"
  ).length;

  const firstName = session.user.name?.split(" ")[0] ?? "Parent";
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: FolderOpen,
      iconBg: "bg-[#eef2ff]",
      iconColor: "text-[#4f46e5]",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: CreditCard,
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#c2410c]",
    },
    {
      label: "Admissions Offered",
      value: admissionsOffered,
      icon: GraduationCap,
      iconBg: "bg-[#f0fdf4]",
      iconColor: "text-[#15803d]",
    },
  ];

  /* ── Authenticated: Dashboard ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background">
      <ClientHeader
        user={session.user}
        schoolName={config.schoolName}
        schoolLogo={config.schoolLogo}
      />

      <main className="pt-14 md:pt-0 md:pl-64">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div
          className="border-b border-border/60 bg-card"
          style={{ boxShadow: "0 1px 0 rgba(36,19,108,0.04)" }}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
            <div className="animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {config.schoolName}
              </p>
              <h1 className="mt-0.5 font-heading text-2xl font-semibold text-foreground">
                {greeting}, {firstName}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {now.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
          {/* ── Stat cards ────────────────────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
              <article
                key={label}
                className="animate-fade-up rounded-2xl border border-border bg-card p-5 shadow-sm"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-2 font-heading text-4xl font-semibold text-foreground">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
                  >
                    <Icon className={`size-5 ${iconColor}`} />
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* ── Deadline countdown ────────────────────────────────────── */}
          {currentSession && (
            <div className="animate-fade-up delay-150">
              <DeadlineCountdown
                closeAt={currentSession.closeAt.toISOString()}
              />
            </div>
          )}

          {/* ── Guidelines ───────────────────────────────────────────── */}
          {currentSession && (
            <div className="animate-fade-up delay-225">
              <GuidelinesSection amount={Number(currentSession.amount)} />
            </div>
          )}

          {/* ── New application CTA ───────────────────────────────────── */}
          {openSessions.length > 0 && (
            <div
              className="animate-fade-up delay-300 overflow-hidden rounded-2xl border border-border shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 75%, var(--brand-accent)) 100%)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Enrollment Open
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold text-white">
                    Ready to apply for {currentSession?.year ?? "this year"}?
                  </h2>
                  <p className="mt-1 text-sm text-white/75">
                    Submit a new application for an open enrollment session.
                  </p>
                </div>
                <Button
                  asChild
                  className="shrink-0 bg-white font-medium text-primary shadow-md hover:bg-white/95"
                >
                  <Link href="/new-application">
                    Start application
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* ── Applications table ────────────────────────────────────── */}
          <div className="animate-fade-up delay-375 rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-5">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Your Applications
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track status, payments, and download admission documents.
              </p>
            </div>
            <div className="p-4">
              <ApplicationsTable applications={applications} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
