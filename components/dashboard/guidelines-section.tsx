import { CheckCircle2 } from "lucide-react";

type GuidelinesSectionProps = {
  amount: number;
  currency?: string;
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
}: GuidelinesSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="font-heading text-sm font-semibold text-foreground sm:text-base">
          Application guidelines
        </h2>
        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-foreground sm:px-3 sm:text-sm">
          Fee: {currency}{amount.toLocaleString()}
        </span>
      </div>
      <ul className="space-y-0 divide-y divide-border">
        {GUIDELINES.map((line, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-sm leading-relaxed text-muted-foreground">
              {line}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
