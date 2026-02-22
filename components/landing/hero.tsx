import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

type LandingHeroProps = {
  hasSession: boolean;
  yearLabel?: string;
};

export function LandingHero({ hasSession, yearLabel }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14">
      <div className="pointer-events-none absolute -left-16 -top-14 h-56 w-56 rounded-full bg-primary/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-accent/25 blur-2xl" />

      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs tracking-wide uppercase text-muted-foreground">
            Enrollment made human
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Your child&apos;s next chapter starts with clarity, not chaos.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Apply in minutes, pay securely, and track progress without paperwork
            overload. A calm enrollment experience for busy families.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-sm">
              <Link href="/register">
                Start application <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          {hasSession && (
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2 text-sm">
              <CalendarDays className="size-4 text-primary" />
              <span>
                Active enrollment {yearLabel ? `for ${yearLabel}` : ""} is now
                open.
              </span>
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-xl space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
            <Image
              src="/hero-illustration.svg"
              alt="Families and school enrollment illustration"
              width={1200}
              height={800}
              className="h-auto w-full"
              priority
            />
          </div>
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-primary/10 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Families enrolled
                </p>
                <p className="mt-2 text-3xl font-semibold">500+</p>
              </div>
              <div className="rounded-2xl bg-accent/30 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Steps to complete
                </p>
                <p className="mt-2 text-3xl font-semibold">3</p>
              </div>
              <div className="rounded-2xl bg-secondary p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  What parents get
                </p>
                <p className="mt-2 text-lg font-medium">
                  Real-time status tracking, receipts, and admission letters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
