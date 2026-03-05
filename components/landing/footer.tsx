import Link from "next/link";
import { FooterLogo } from "@/components/landing/footer-logo";

type LandingFooterProps = {
  schoolName: string;
  schoolDescription: string;
  schoolLogo: string;
};

export function LandingFooter({
  schoolName,
  schoolDescription,
  schoolLogo,
}: LandingFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1fr_160px_160px]">
          {/* Brand column */}
          <div>
            <Link href="/" className="group mb-4 flex items-center gap-3">
              <FooterLogo schoolLogo={schoolLogo} />
              <span className="font-heading text-[16px] font-semibold text-foreground">
                {schoolName}
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {schoolDescription}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground/60">
              Explore
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "#how-it-works", label: "How it works" },
                { href: "#highlights", label: "Platform features" },
                { href: "#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground/60">
              Account
            </p>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/login", label: "Sign in" },
                { href: "/register", label: "Start application" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © {year} {schoolName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Secure enrollment platform
          </p>
        </div>
      </div>
    </footer>
  );
}
