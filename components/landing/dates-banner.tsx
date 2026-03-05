import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";

type LandingDatesBannerProps = {
  closeAt?: string;
  amount?: number;
};

export function LandingDatesBanner({ closeAt, amount }: LandingDatesBannerProps) {
  if (!closeAt) {
    return (
      <section className="bg-background px-5 py-10">
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-border bg-card px-7 py-5">
          <div className="flex items-center gap-3">
            <Clock className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Enrollment dates will be announced soon. Check back shortly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden px-5 py-16"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 70%, var(--brand-accent)) 100%)",
      }}
    >
      {/* Dot texture */}
      <div className="dot-grid absolute inset-0 opacity-60" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/55">
            Limited time
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-white sm:text-4xl">
            Applications are open now
          </h2>
          {typeof amount === "number" && (
            <p className="mt-2 text-base text-white/70">
              Application fee: ₦{amount.toLocaleString()}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-md transition-all hover:bg-white/95 hover:shadow-lg"
            >
              Apply now
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Countdown */}
        <div className="rounded-2xl border border-white/20 bg-white/10 px-7 py-5 backdrop-blur-sm">
          <DeadlineCountdown closeAt={closeAt} compact inverse />
        </div>
      </div>
    </section>
  );
}
