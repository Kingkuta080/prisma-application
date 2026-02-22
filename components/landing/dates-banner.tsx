import { DeadlineCountdown } from "@/components/dashboard/deadline-countdown";

type LandingDatesBannerProps = {
  closeAt?: string;
  amount?: number;
};

export function LandingDatesBanner({ closeAt, amount }: LandingDatesBannerProps) {
  if (!closeAt) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto w-full max-w-6xl rounded-2xl border border-border bg-card px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Enrollment dates will be announced soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-accent/40 bg-accent/25 px-6 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Enrollment deadline
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              Applications are currently open
            </h3>
            {typeof amount === "number" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Application fee: {amount.toFixed(2)}
              </p>
            )}
          </div>
          <DeadlineCountdown closeAt={closeAt} compact />
        </div>
      </div>
    </section>
  );
}
