"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type LandingNavbarProps = {
  schoolName: string;
  schoolLogo: string;
};

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#highlights", label: "Why Us" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar({ schoolName, schoolLogo }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-primary shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/20 transition-all group-hover:bg-white/20">
              <Image
                src={schoolLogo}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="36px"
                unoptimized={schoolLogo.startsWith("/") && !schoolLogo.endsWith(".svg")}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
                }}
              />
              <GraduationCap className="size-4 text-white/80" style={{ display: "none" }} />
            </span>
            <span className="font-heading text-[16px] font-semibold text-white">
              {schoolName}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-white font-semibold text-primary shadow-md hover:bg-white/95"
            >
              <Link href="/register">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute inset-y-0 right-0 w-72 flex flex-col px-5 py-6"
            style={{
              background:
                "linear-gradient(175deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 85%, black) 100%)",
            }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-heading text-[16px] font-semibold text-white">
                {schoolName}
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/12 hover:text-white"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-auto space-y-2">
              <Button
                asChild
                variant="outline"
                className="w-full border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="w-full bg-white font-semibold text-primary hover:bg-white/95"
              >
                <Link href="/register">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
