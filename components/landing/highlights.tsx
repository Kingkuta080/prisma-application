const HIGHLIGHTS = [
  {
    title: "Simple online process",
    text: "No printed forms and no office queues. Everything stays in one dashboard.",
    className: "md:col-span-2 bg-secondary",
  },
  {
    title: "Secure payments",
    text: "Payment records are tracked with clear status and verification history.",
    className: "bg-card",
  },
  {
    title: "Instant PDFs",
    text: "Receipts and letters are generated as downloadable documents.",
    className: "bg-accent/30",
  },
  {
    title: "Application tracking",
    text: "Know exactly what stage each application is in at any time.",
    className: "md:col-span-2 bg-primary/10",
  },
];

export function LandingHighlights() {
  return (
    <section id="highlights" className="px-4 py-16">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-wide text-primary">
            Why families choose this platform
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Built for clarity, speed, and peace of mind
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className={`rounded-2xl border border-border p-6 shadow-sm ${item.className}`}
            >
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
