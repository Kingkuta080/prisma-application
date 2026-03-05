import { Monitor, Lock, FileDown, Search } from "lucide-react";

const FEATURES = [
  {
    icon: Monitor,
    title: "Everything online",
    description:
      "No printed forms, no office queues. Apply, pay, and track your application entirely from your phone or laptop.",
    colSpan: "md:col-span-2",
    bg: "bg-secondary",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Lock,
    title: "Secure payments",
    description:
      "Every transaction is processed through our verified gateway with full status tracking.",
    colSpan: "",
    bg: "bg-card",
    iconBg: "bg-[#fff7ed] text-[#c2410c]",
  },
  {
    icon: FileDown,
    title: "Instant documents",
    description:
      "Receipts and admission letters are generated as print-ready PDFs the moment they're ready.",
    colSpan: "",
    bg: "bg-card",
    iconBg: "bg-[#f0fdf4] text-[#15803d]",
  },
  {
    icon: Search,
    title: "Real-time tracking",
    description:
      "Always know exactly where your application stands—submitted, paid, or admitted.",
    colSpan: "md:col-span-2",
    bg: "bg-primary/5",
    iconBg: "bg-[#eef2ff] text-[#4338ca]",
  },
];

export function LandingHighlights() {
  return (
    <section id="highlights" className="bg-background px-5 py-24">
      <div className="mx-auto w-full max-w-6xl">
        {/* Section header */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Platform Highlights
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Built to remove friction from every step
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Designed for international school families who expect clarity,
            speed, and transparency throughout enrollment.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className={`group rounded-2xl border border-border p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.colSpan} ${item.bg}`}
              >
                <span
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
