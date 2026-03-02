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
import { FolderOpen, CreditCard, GraduationCap, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Cold start / auth error: show landing
  }

  if (!session?.user) {
    redirect("/login");
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

        <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-8">
          {/* ── Enrollment Open CTA (top, above analytics) ──────────────────── */}
          {openSessions.length > 0 && (
            <div
              className="animate-fade-up overflow-hidden rounded-2xl border border-border shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 75%, var(--brand-accent)) 100%)",
              }}
            >
              <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-5 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Parent Portal · Session {currentSession?.year ?? "—"}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                    Enrollment Open
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-semibold text-white sm:text-xl">
                    Ready to apply for {currentSession?.year ?? "this year"}?
                  </h2>
                  <p className="mt-1 text-sm text-white/75">
                    Submit a new application for an open enrollment session.
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full shrink-0 bg-white font-medium text-primary shadow-md hover:bg-white/95 sm:w-auto"
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
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
              <article
                key={label}
                className="animate-fade-up rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1.5 font-heading text-3xl font-semibold text-foreground sm:mt-2 sm:text-4xl">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${iconBg}`}
                  >
                    <Icon className={`size-4 sm:size-5 ${iconColor}`} />
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
          <div className="animate-fade-up delay-225 grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-6">
            {/* Left: Your Applications */}
            <div className="min-w-0 rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
                  Your Applications
                </h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Track status, payments, and download admission documents.
                </p>
              </div>
              <div className="p-3 sm:p-4">
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
