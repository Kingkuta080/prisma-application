import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/60 px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">School Enrollment Platform</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A public-facing enrollment experience designed for families.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Quick links</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <a href="#highlights" className="hover:text-foreground">
              Highlights
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Account</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Start application
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 w-full max-w-6xl text-xs text-muted-foreground">
        © {new Date().getFullYear()} School Enrollment Platform. All rights
        reserved.
      </p>
    </footer>
  );
}
