import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { NewApplicationForm } from "@/components/new-application-form";
import { FilePlus2, Info } from "lucide-react";

export default async function NewApplicationPage() {
  const openSessions = await prisma.applicationSession.findMany({
    where: {
      openAt: { lte: new Date() },
      closeAt: { gte: new Date() },
    },
    orderBy: { year: "desc" },
  });

  const serializedSessions = openSessions.map((s) => ({
    id: s.id,
    year: s.year,
    amount: Number(s.amount),
    availableClasses: (s as unknown as { availableClasses: string[] }).availableClasses,
  }));

  if (openSessions.length === 0) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Info className="size-5 text-muted-foreground" />
          </span>
          <h1 className="mt-4 font-heading text-xl font-semibold text-foreground">
            No open sessions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No application sessions are currently open. Please check back later
            when enrollment begins.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FilePlus2 className="size-5 text-primary" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              New Application
            </h1>
            <p className="text-sm text-muted-foreground">
              Submit an enrollment application for your ward.
            </p>
          </div>
        </div>
      </div>

      {/* Form card — flush on mobile, rounded card on tablet+ */}
      <div className="bg-white p-4 sm:rounded-2xl sm:border sm:border-border sm:p-6 sm:shadow-sm md:p-8">
        <NewApplicationForm sessions={serializedSessions} />
      </div>
    </div>
  );
}
