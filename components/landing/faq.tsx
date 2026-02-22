const FAQ_ITEMS = [
  {
    question: "Who can apply?",
    answer:
      "Any parent or guardian applying for the available enrollment session can submit an application.",
  },
  {
    question: "What documents do I need?",
    answer:
      "Basic child and parent information is required during submission. Additional requirements are shared by the school if needed.",
  },
  {
    question: "How do I pay the application fee?",
    answer:
      "After submitting an application, payment can be completed from your dashboard and reflected in your status.",
  },
  {
    question: "When do I receive admission updates?",
    answer:
      "As soon as admissions are processed, your dashboard is updated and admission letters become downloadable.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-wide text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Questions parents ask most
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-xl border border-border bg-card p-4"
            >
              <summary className="cursor-pointer list-none font-medium">
                <span className="inline-flex items-center justify-between gap-2">
                  {item.question}
                  <span className="text-primary transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
