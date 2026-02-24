"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SchoolLogo } from "@/components/school-logo";

type LandingNavbarProps = {
  schoolName?: string;
  schoolLogo?: string;
};

export function LandingNavbar({
  schoolName = "School Enrollment Platform",
  schoolLogo = "/logo.png",
}: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        isScrolled
          ? "border-b border-border/70 bg-background/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <SchoolLogo schoolLogo={schoolLogo} size={32} />
          <span>{schoolName}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground">
            How It Works
          </a>
          <a href="#highlights" className="hover:text-foreground">
            Highlights
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/register">Apply Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
