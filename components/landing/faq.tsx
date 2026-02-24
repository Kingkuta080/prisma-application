const FAQ_ITEMS = [
  {
    question: "Who is eligible to apply?",
    answer:
      "Any parent or guardian can submit an application for their child during an active enrollment session. Both new and returning families are welcome.",
  },
  {
    question: "What information do I need to complete my application?",
    answer:
      "You'll need your contact details, your child's full name and date of birth, and the preferred class. The process takes under five minutes.",
  },
  {
    question: "How do I pay the application fee?",
    answer:
      "After submitting your application, you'll be directed to our secure payment gateway. Your dashboard will update automatically once payment is confirmed.",
  },
  {
    question: "When will I hear about the admission decision?",
    answer:
      "Admission decisions are processed by the school and released directly to your dashboard. You'll be able to download your official admission letter when it's ready.",
  },
  {
    question: "Can I apply for multiple children at once?",
    answer:
      "Yes. You can submit separate applications for each child from the same parent account, each tracked independently in your dashboard.",
  },
];

export function LandingFaq() {
  return (
    <section id="faq" className="bg-background px-5 py-24">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-12 grid gap-6 md:grid-cols-[280px_1fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="font-heading text-3xl font-semibold text-foreground">
              Common questions from families
            </h2>
          </div>
          <p className="self-end text-sm leading-relaxed text-muted-foreground md:pl-4">
            Everything you need to know before submitting your application.
            Reach out through the school office if you need further assistance.
          </p>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={item.question}
              className="group px-6 py-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-medium text-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3">
                  <span className="font-heading text-sm font-semibold text-muted-foreground/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.question}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 pl-8 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
