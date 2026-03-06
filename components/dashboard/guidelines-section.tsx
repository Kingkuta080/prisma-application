import { CheckCircle2, Info } from "lucide-react";

type GuidelinesSectionProps = {
  amount: number;
  currency?: string;
  /** When true renders a compact horizontal strip for mobile */
  mobile?: boolean;
};

const GUIDELINES = [
  "Submit one application per child for the selected enrollment session.",
  "Ensure all personal details are accurate before submitting — changes may require re-application.",
  "Payment of the application fee is required to complete and confirm your submission.",
  "Once paid, download your receipt from your dashboard. Admission letters will be available when decisions are released.",
];

export function GuidelinesSection({
  amount,
  currency = "₦",
  mobile = false,
}: GuidelinesSectionProps) {
  if (mobile) {
    return (
      <div className="rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Info className="size-4 shrink-0 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              Application Guidelines
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Fee: {currency}{amount.toLocaleString()}
          </span>
        </div>
        <ul className="grid grid-cols-1 divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0">
          {GUIDELINES.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 px-4 py-2.5 sm:border-b-0 sm:odd:border-r sm:odd:border-border/60"
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-2.5 text-primary" />
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {line}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Info className="size-4 text-muted-foreground" />
              Application Guidelines
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Please read before submitting
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Fee: {currency}{amount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Guidelines list */}
      <ul className="divide-y divide-border/60">
        {GUIDELINES.map((line, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-3.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-3 text-primary" />
            </span>
            <span className="text-[13px] leading-relaxed text-muted-foreground">
              {line}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
