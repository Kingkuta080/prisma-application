import { CircleCheckBig, CreditCard, FilePenLine } from "lucide-react";
import Image from "next/image";

const STEPS = [
  {
    id: "01",
    title: "Create account and apply",
    description:
      "Set up your parent profile and submit your child details in one flow.",
    icon: FilePenLine,
  },
  {
    id: "02",
    title: "Complete payment",
    description:
      "Secure payment confirms your application and unlocks printable records.",
    icon: CreditCard,
  },
  {
    id: "03",
    title: "Receive updates",
    description:
      "Track progress and download admission letters as decisions are released.",
    icon: CircleCheckBig,
  },
];

export function LandingJourney() {
  return (
    <section id="how-it-works" className="px-4 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-wide text-primary">
            How Enrollment Works
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Three clear steps from form to admission
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.id}
                className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                {index < STEPS.length - 1 && (
                  <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 border-t border-dashed border-border md:block" />
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl font-semibold text-primary/70">
                    {step.id}
                  </span>
                  <span className="inline-flex rounded-full bg-secondary p-2">
                    <Icon className="size-4 text-primary" />
                  </span>
                </div>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Image
            src="/enrollment-steps.svg"
            alt="Enrollment process illustration"
            width={1200}
            height={500}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
