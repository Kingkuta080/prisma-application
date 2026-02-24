import { UserPlus, CreditCard, BadgeCheck } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Create an account & apply",
    description:
      "Register as a parent, complete your profile, and submit your child's application details in one guided flow.",
    icon: UserPlus,
    accent: "bg-[#eef2ff] text-[#4338ca]",
    border: "border-[#c7d2fe]",
  },
  {
    number: "02",
    title: "Complete payment securely",
    description:
      "Pay the application fee through our secure payment gateway. Your receipt is generated instantly.",
    icon: CreditCard,
    accent: "bg-[#fff7ed] text-[#c2410c]",
    border: "border-[#fed7aa]",
  },
  {
    number: "03",
    title: "Receive your admission decision",
    description:
      "Track your application status in real-time. Download your admission letter directly from your dashboard.",
    icon: BadgeCheck,
    accent: "bg-[#f0fdf4] text-[#15803d]",
    border: "border-[#bbf7d0]",
  },
];

export function LandingJourney() {
  return (
    <section id="how-it-works" className="bg-background px-5 py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            The Enrollment Process
          </p>
          <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
            From application to admission in three steps
          </h2>
        </div>

        {/* Steps grid */}
        <div className="relative grid gap-6 md:grid-cols-3">
          {/* Connecting line on desktop */}
          <div className="absolute left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] top-12 hidden h-px bg-gradient-to-r from-border via-border to-border md:block" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={step.number}
                className="relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Step number + icon row */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-heading text-4xl font-semibold text-foreground/15 leading-none select-none">
                    {step.number}
                  </span>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${step.accent} ${step.border}`}
                  >
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Step connector dot (desktop, between cards) */}
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-[46px] z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card md:flex">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
