import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";
import { GuidelinesSection } from "@/components/dashboard/guidelines-section";
import { ApplicationsTable } from "@/components/applications-table";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-semibold">School Enrollment Platform</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Sign in to manage applications.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/register">Register</Link>
          </Button>
        </div>
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

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader user={session.user} />
      <main className="flex-1 container p-4 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {currentSession && (
          <>
            <DeadlineCountdown closeAt={currentSession.closeAt.toISOString()} />
            <GuidelinesSection amount={Number(currentSession.amount)} />
          </>
        )}

        {openSessions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Start application</h2>
            <Button asChild>
              <Link href="/new-application">Start new application</Link>
            </Button>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-3">Your applications</h2>
          <ApplicationsTable applications={applications} />
        </section>
      </main>
    </div>
  );
}
