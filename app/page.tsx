import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSchoolConfig } from "@/lib/school-config";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { GuidelinesSection } from "@/components/dashboard/guidelines-section";
import { ApplicationsTable } from "@/components/applications-table";
import { LandingNavbar } from "@/components/landing/navbar";
import { FolderOpen, CreditCard, GraduationCap, ArrowRight } from "lucide-react";
import { LandingHero } from "@/components/landing/hero";
import { LandingJourney } from "@/components/landing/journey";
import { LandingHighlights } from "@/components/landing/highlights";
import { LandingDatesBanner } from "@/components/landing/dates-banner";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Cold start / auth error: show landing
  }

  if (!session?.user) {
    let openSession: { closeAt: Date; amount: number; year: number } | null =
      null;
    try {
      const sessions = await prisma.applicationSession.findMany({
        where: {
          openAt: { lte: new Date() },
          closeAt: { gte: new Date() },
        },
        orderBy: { year: "desc" },
        take: 1,
      });
      if (sessions[0]) {
        openSession = {
          closeAt: sessions[0].closeAt,
          amount: Number(sessions[0].amount),
          year: sessions[0].year,
        };
      }
    } catch {
      // DB error: still show landing without session data
    }
    const config = getSchoolConfig();
    return (
      <div className="min-h-screen bg-background">
        <LandingNavbar
          schoolName={config.schoolName}
          schoolLogo={config.schoolLogo}
        />
        <main className="flex-1">
          <LandingHero
            hasSession={!!openSession}
            yearLabel={openSession ? String(openSession.year) : undefined}
            schoolName={config.schoolName}
            schoolDescription={config.schoolDescription}
          />
          <LandingJourney />
          <LandingHighlights />
          <LandingDatesBanner
            closeAt={openSession?.closeAt.toISOString()}
            amount={openSession?.amount}
          />
          <LandingFaq />
          <LandingFooter
            schoolName={config.schoolName}
            schoolDescription={config.schoolDescription}
            schoolLogo={config.schoolLogo}
          />
        </main>
      </div>
    );
  }

  const hasName = !!session.user.name?.trim();
  const hasPhone = !!session.user.phone?.trim();
  if (!hasName || !hasPhone) {
    redirect("/complete-profile");
  }

  const [openSessions, applicationsRaw] = await Promise.all([
    prisma.applicationSession.findMany({
      where: {
        openAt: { lte: new Date() },
        closeAt: { gte: new Date() },
      },
      orderBy: { year: "desc" },
    }),
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        session: true,
        payments: { orderBy: { createdAt: "desc" } },
        admission: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentSession = openSessions[0] ?? null;
  const applications = applicationsRaw.map((app) => ({
    id: app.id,
    status: app.status,
    wardName: app.wardName,
    class: (app as unknown as { class: string }).class,
    session: {
      year: app.session.year,
      amount: Number(app.session.amount),
    },
    payments: app.payments.map((p) => ({ id: p.id, status: p.status })),
    admission: app.admission
      ? { id: app.admission.id, status: app.admission.status }
      : null,
  }));

  const config = getSchoolConfig();
  const pendingPayments = applications.filter((app) =>
    app.payments.some((p) => p.status === "PENDING")
  ).length;
  const admissionsOffered = applications.filter(
    (app) => app.admission?.status === "OFFERED"
  ).length;

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

  return (
    <div className="min-h-screen bg-background">
      <main>
        <DashboardPageHeader
          user={session.user}
          schoolName={config.schoolName}
          schoolLogo={config.schoolLogo}
        />

        <div className="mx-auto max-w-5xl space-y-6 px-5 py-8">
          {/* ── Enrollment Open CTA (top, above analytics) ──────────────────── */}
          {openSessions.length > 0 && (
            <div
              className="animate-fade-up overflow-hidden rounded-2xl border border-border shadow-sm"
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

          {/* ── Stat cards ────────────────────────────────────────────────── */}
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

          {/* ── Deadline countdown ────────────────────────────────────────── */}
          {currentSession && (
            <div className="animate-fade-up delay-150">
              <DeadlineCountdown
                closeAt={currentSession.closeAt.toISOString()}
              />
            </div>
          )}

          {/* ── Your Applications (left) | Application guidelines (right) ──── */}
          <div className="animate-fade-up delay-225 grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left: Your Applications */}
            <div className="min-w-0 rounded-2xl border border-border bg-card shadow-sm">
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

            {/* Right: Application guidelines */}
            {currentSession && (
              <GuidelinesSection amount={Number(currentSession.amount)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
