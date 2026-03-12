import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { GuidelinesSection } from "@/components/dashboard/guidelines-section";
import { ApplicationsTable } from "@/components/applications-table";
import { PortalGuidelinesModal } from "@/components/portal-guidelines-modal";
import {
  FolderOpen,
  CreditCard,
  GraduationCap,
  Plus,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // Cold start / auth error
  }

  if (!session?.user) {
    redirect("/login");
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

  const currentSession = openSessions[0] ?? null;
  const pendingPayments = applications.filter((app) =>
    app.payments.some((p) => p.status === "PENDING")
  ).length;
  const admissionsOffered = applications.filter(
    (app) => app.admission?.status === "OFFERED"
  ).length;

  const firstName = session.user.name?.split(" ")[0] || "Parent";

  const statCards = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: FolderOpen,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50 border-violet-100",
      trend: applications.length > 0 ? `${applications.length} submitted` : "None yet",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: CreditCard,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50 border-orange-100",
      trend: pendingPayments > 0 ? "Action required" : "All clear",
    },
    {
      label: "Admissions Offered",
      value: admissionsOffered,
      icon: GraduationCap,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-100",
      trend: admissionsOffered > 0 ? "Congratulations!" : "Awaiting decisions",
    },
  ];

  return (
    <>
      <PortalGuidelinesModal
        amount={currentSession ? Number(currentSession.amount) : 16000}
      />

      <div className="space-y-4 sm:space-y-6">
        {/* ── Welcome banner ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-primary/3 shadow-sm">
          {/* Subtle brand tint + pattern */}
          <div className="pointer-events-none absolute inset-0 bg-primary/3" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--primary) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="relative flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-lg font-semibold text-foreground sm:text-2xl">
                Welcome back, {firstName}
              </h1>
              {openSessions.length > 0 && currentSession ? (
                <>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {currentSession.year} enrollment is open — submit before the deadline.
                  </p>
                  <div className="mt-2 sm:mt-3">
                    <DeadlineCountdown
                      closeAt={currentSession.closeAt.toISOString()}
                      compact
                    />
                  </div>
                </>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Here&apos;s a summary of your ward&apos;s enrollment activity.
                </p>
              )}
            </div>
            {openSessions.length > 0 && (
              <Button
                asChild
                className="w-full shrink-0 bg-primary font-semibold text-primary-foreground shadow hover:bg-primary/90 sm:w-auto"
              >
                <Link href="/new-application">
                  <Plus className="size-4" />
                  Apply Now
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {statCards.map(({ label, value, icon: Icon, iconColor, iconBg, trend }) => (
            <div
              key={label}
              className="rounded-2xl border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                {/* Icon — top on mobile, right on desktop */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border sm:order-last sm:h-10 sm:w-10 ${iconBg}`}
                >
                  <Icon className={`size-4 sm:size-5 ${iconColor}`} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                    {/* Shorten label on mobile */}
                    <span className="sm:hidden">
                      {label === "Total Applications"
                        ? "Applications"
                        : label === "Pending Payments"
                        ? "Payments"
                        : "Admissions"}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </p>
                  <p className="mt-1 font-heading text-2xl font-semibold text-foreground sm:mt-2 sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-1 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                    <TrendingUp className="size-3 shrink-0" />
                    {trend}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Guidelines — mobile only (above table) ────────────────────────── */}
        {currentSession && (
          <div className="lg:hidden">
            <GuidelinesSection amount={Number(currentSession.amount)} mobile />
          </div>
        )}

        {/* ── Applications table + Guidelines (desktop sidebar) ────────────── */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
          {/* Applications */}
          <div className="min-w-0 rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-foreground">
                  Your Applications
                </h2>
                <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                  Track status, make payments, and download documents.
                </p>
              </div>
              {openSessions.length > 0 && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  <Link href="/new-application">
                    <Plus className="mr-1.5 size-3.5" />
                    <span className="hidden sm:inline">Apply</span>
                    <span className="sm:hidden">New</span>
                  </Link>
                </Button>
              )}
            </div>
            <div className="p-3 sm:p-4">
              <ApplicationsTable applications={applications} />
            </div>
          </div>

          {/* Guidelines desktop sidebar */}
          {currentSession && (
            <div className="hidden self-start lg:block lg:sticky lg:top-20">
              <GuidelinesSection amount={Number(currentSession.amount)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
